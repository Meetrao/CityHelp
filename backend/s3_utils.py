import os, uuid, io
import boto3
from PIL import Image

BUCKET = os.getenv("AWS_S3_BUCKET")
REGION = os.getenv("AWS_REGION", "ap-south-1")
s3 = boto3.client("s3", region_name=REGION)

ALLOWED_EXT = {"jpg","jpeg","png","webp"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXT

def upload_image(file_storage, folder="issues"):
    filename = file_storage.filename
    if not allowed_file(filename):
        raise ValueError("invalid file type")
    ext = filename.rsplit('.',1)[1].lower()
    key = f"{folder}/{uuid.uuid4().hex}.{ext}"

    img = Image.open(file_storage.stream).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    buf.seek(0)

    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=buf,
        ContentType="image/jpeg",
        ACL="public-read"
    )
    url = f"https://{BUCKET}.s3.{REGION}.amazonaws.com/{key}"
    return url, key
