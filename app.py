import os
from functools import wraps
from pathlib import Path
from uuid import uuid4

from flask import Flask, flash, jsonify, redirect, render_template, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif", "svg"}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
database_url = os.environ.get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'site.db'}")
app.config["SQLALCHEMY_DATABASE_URI"] = database_url.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class SiteSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    page_title = db.Column(db.String(255), nullable=False, default="Тестовая верстка")
    meta_description = db.Column(
        db.String(320),
        nullable=False,
        default="Адаптивная страница с управлением контентом через админку.",
    )


class ContentBlock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(512), nullable=True)
    button_text = db.Column(db.String(120), nullable=True)
    button_url = db.Column(db.String(255), nullable=True)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)


def is_allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin_login"))
        return func(*args, **kwargs)

    return wrapper


def seed_data():
    settings = SiteSettings.query.first()
    if settings is None:
        settings = SiteSettings()
        db.session.add(settings)

    if ContentBlock.query.count() == 0:
        db.session.add_all(
            [
                ContentBlock(
                    key="hero",
                    title="Создаём аккуратные интерфейсы",
                    body=(
                        "Резиновая адаптивная верстка, которая корректно выглядит "
                        "на всех разрешениях."
                    ),
                    image_url="https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
                    button_text="Оставить заявку",
                    button_url="#contact",
                    order_index=1,
                ),
                ContentBlock(
                    key="feature",
                    title="Редактирование контента без кода",
                    body="Меняйте тексты, картинки и порядок блоков через удобную админку.",
                    image_url="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
                    order_index=2,
                ),
                ContentBlock(
                    key="feature",
                    title="Гибкая структура страницы",
                    body=(
                        "Блоки можно включать, выключать и переставлять местами "
                        "в пару кликов."
                    ),
                    image_url="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
                    order_index=3,
                ),
                ContentBlock(
                    key="cta",
                    title="Готовы к запуску",
                    body="Соберём проект и подготовим к деплою на удобный хостинг.",
                    button_text="Связаться",
                    button_url="#contact",
                    order_index=4,
                ),
            ]
        )

    db.session.commit()


@app.route("/")
def index():
    settings = SiteSettings.query.first()
    blocks = (
        ContentBlock.query.filter_by(is_active=True)
        .order_by(ContentBlock.order_index.asc(), ContentBlock.id.asc())
        .all()
    )
    return render_template("index.html", settings=settings, blocks=blocks)


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        password = request.form.get("password", "")
        if password == os.environ.get("ADMIN_PASSWORD", "admin123"):
            session["is_admin"] = True
            return redirect(url_for("admin_dashboard"))
        flash("Неверный пароль", "error")
    return render_template("admin_login.html")


@app.route("/admin/logout")
@admin_required
def admin_logout():
    session.pop("is_admin", None)
    return redirect(url_for("admin_login"))


@app.route("/admin", methods=["GET", "POST"])
@admin_required
def admin_dashboard():
    settings = SiteSettings.query.first()
    if request.method == "POST":
        settings.page_title = request.form.get("page_title", settings.page_title).strip()
        settings.meta_description = request.form.get(
            "meta_description", settings.meta_description
        ).strip()
        db.session.commit()
        flash("SEO настройки сохранены", "success")
        return redirect(url_for("admin_dashboard"))

    blocks = ContentBlock.query.order_by(ContentBlock.order_index.asc(), ContentBlock.id.asc()).all()
    return render_template("admin_dashboard.html", settings=settings, blocks=blocks)


@app.route("/admin/block/<int:block_id>", methods=["GET", "POST"])
@admin_required
def admin_edit_block(block_id: int):
    block = ContentBlock.query.get_or_404(block_id)

    if request.method == "POST":
        block.title = request.form.get("title", "").strip()
        block.body = request.form.get("body", "").strip()
        block.button_text = request.form.get("button_text", "").strip() or None
        block.button_url = request.form.get("button_url", "").strip() or None
        block.is_active = request.form.get("is_active") == "on"

        image_url = request.form.get("image_url", "").strip()
        if image_url:
            block.image_url = image_url

        upload = request.files.get("image_file")
        if upload and upload.filename:
            if is_allowed_file(upload.filename):
                ext = upload.filename.rsplit(".", 1)[1].lower()
                file_name = f"{uuid4().hex}.{ext}"
                destination = UPLOAD_DIR / secure_filename(file_name)
                upload.save(destination)
                block.image_url = f"/static/uploads/{file_name}"
            else:
                flash("Недопустимый формат файла", "error")
                return redirect(url_for("admin_edit_block", block_id=block.id))

        db.session.commit()
        flash("Блок обновлён", "success")
        return redirect(url_for("admin_dashboard"))

    return render_template("admin_edit_block.html", block=block)


@app.post("/admin/block/<int:block_id>/move/<string:direction>")
@admin_required
def admin_move_block(block_id: int, direction: str):
    blocks = ContentBlock.query.order_by(ContentBlock.order_index.asc(), ContentBlock.id.asc()).all()
    current_index = next((idx for idx, item in enumerate(blocks) if item.id == block_id), None)
    if current_index is None:
        return redirect(url_for("admin_dashboard"))

    if direction == "up" and current_index > 0:
        swap_index = current_index - 1
    elif direction == "down" and current_index < len(blocks) - 1:
        swap_index = current_index + 1
    else:
        return redirect(url_for("admin_dashboard"))

    blocks[current_index].order_index, blocks[swap_index].order_index = (
        blocks[swap_index].order_index,
        blocks[current_index].order_index,
    )
    db.session.commit()
    return redirect(url_for("admin_dashboard"))


@app.post("/admin/reorder")
@admin_required
def admin_reorder_blocks():
    payload = request.get_json(silent=True) or {}
    ids = payload.get("order", [])
    if not isinstance(ids, list):
        return jsonify({"ok": False, "error": "Invalid payload"}), 400

    blocks = ContentBlock.query.order_by(ContentBlock.order_index.asc(), ContentBlock.id.asc()).all()
    known_ids = {item.id for item in blocks}
    if set(ids) != known_ids:
        return jsonify({"ok": False, "error": "Order does not match blocks"}), 400

    for index, block_id in enumerate(ids, start=1):
        block = next(item for item in blocks if item.id == block_id)
        block.order_index = index

    db.session.commit()
    return jsonify({"ok": True})


def init_app():
    with app.app_context():
        db.create_all()
        seed_data()


if __name__ == "__main__":
    init_app()
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", "5000")))
