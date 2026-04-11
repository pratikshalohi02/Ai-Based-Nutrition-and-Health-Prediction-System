from io import BytesIO

from PIL import Image, UnidentifiedImageError

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def load_and_prepare_image(stream) -> Image.Image:
    try:
        image = Image.open(stream)
        image = image.convert("RGB")
        return image.resize((224, 224), Image.Resampling.LANCZOS)
    except UnidentifiedImageError as exc:
        raise ValueError("Uploaded file is not a valid image") from exc
    except Exception as exc:
        raise ValueError("Could not process uploaded image") from exc
