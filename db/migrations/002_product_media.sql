-- Danh sách ảnh có thứ tự cho mỗi sản phẩm. Ảnh đầu danh sách (position nhỏ nhất) được đồng bộ làm cover_id khi lưu.
CREATE TABLE product_media (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  PRIMARY KEY (product_id, media_id)
);
CREATE INDEX product_media_order_idx ON product_media (product_id, position);
CREATE INDEX product_media_media_idx ON product_media (media_id);
