
import json, numpy as np, cv2, torch, timm
MEAN = np.array([0.485, 0.456, 0.406], np.float32); STD = np.array([0.229, 0.224, 0.225], np.float32)
CLASS_NAMES = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]

def crop_pad_512(bgr):
    """Raw fundus (BGR uint8) -> black-border crop -> pad to square -> 512x512 (INTER_AREA). Same as training cache."""
    g = bgr.max(axis=2); ys, xs = np.where(g > 10)
    if len(ys) > 0.05 * g.size:
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    else:
        y0, y1, x0, x1 = 0, bgr.shape[0], 0, bgr.shape[1]
    im = bgr[y0:y1, x0:x1]; h, w = im.shape[:2]; s = max(h, w)
    pad = cv2.copyMakeBorder(im, (s - h) // 2, s - h - (s - h) // 2, (s - w) // 2, s - w - (s - w) // 2,
                             cv2.BORDER_CONSTANT, value=(0, 0, 0))
    return cv2.resize(pad, (512, 512), interpolation=cv2.INTER_AREA)

def to_tensor(bgr512, size=224):
    """512 BGR -> RGB -> resize 224 (INTER_AREA) -> /255 -> ImageNet normalisation -> CHW float tensor."""
    rgb = cv2.resize(cv2.cvtColor(bgr512, cv2.COLOR_BGR2RGB), (size, size), interpolation=cv2.INTER_AREA)
    x = (rgb.astype(np.float32) / 255.0 - MEAN) / STD
    return torch.from_numpy(x.transpose(2, 0, 1))

def ordinal_log_probs(out4):
    p = torch.cummin(torch.sigmoid(out4.float()), dim=1).values
    cum = torch.cat([torch.ones_like(p[:, :1]), p, torch.zeros_like(p[:, :1])], 1)
    pr = (cum[:, :-1] - cum[:, 1:]).clamp_min(1e-6)
    return torch.log(pr / pr.sum(1, keepdim=True))

class DRPredictor:
    def __init__(self, ckpt, calib, device=None):
        self.dev = device or ("cuda" if torch.cuda.is_available() else "cpu")
        ck = torch.load(ckpt, map_location="cpu", weights_only=True); cfg = ck["config"]
        self.size = cfg["img_size"]
        self.model = timm.create_model(cfg["arch"], pretrained=False, num_classes=cfg["num_classes_model_output"],
                                       drop_rate=cfg["drop_rate"])
        self.model.load_state_dict(ck["model_state"]); self.model.to(self.dev).eval()
        c = json.load(open(calib)); self.T, self.thr = c["temperature"], c["referable_threshold"]

    @torch.no_grad()
    def log_probs(self, batch):                      # batch: (N,3,H,W) float tensor
        return ordinal_log_probs(self.model(batch.to(self.dev))).cpu()

    def predict_bgr(self, raw_bgr):
        """One raw fundus image (BGR uint8, any size) -> dict."""
        x = to_tensor(crop_pad_512(raw_bgr), self.size).unsqueeze(0)
        pr = torch.softmax(self.log_probs(x) / self.T, dim=1)[0].numpy()
        pref = float(pr[2:].sum())
        return dict(grade=int(pr.argmax()), grade_name=CLASS_NAMES[int(pr.argmax())], probs=pr.tolist(),
                    confidence=float(pr.max()), p_referable=pref, referable=bool(pref >= self.thr),
                    referable_threshold=self.thr, temperature=self.T)
