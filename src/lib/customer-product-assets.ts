export type CustomerProductAsset = { src: string; alt: string; label: string; width: number; height: number };

// Only visually identifiable families are mapped; technical variants need client confirmation.
export const productAssetBySlug: Partial<Record<string, CustomerProductAsset>> = {
  "be-biogas-composite": {
    "src": "/images/products-2026/white-spherical-tank.webp",
    "alt": "Bể composite dạng cầu màu trắng có chữ Thành Lợi",
    "label": "Bể composite dạng cầu",
    "width": 1200,
    "height": 1600
  },
  "be-nuoi-trong-thuy-san": {
    "src": "/images/products-2026/round-tanks-installation.webp",
    "alt": "Công nhân lắp ghép bể composite tròn màu xanh ngoài trời",
    "label": "Lắp ghép bể tròn composite",
    "width": 2000,
    "height": 1500
  },
  "thung-cho-tom-ca": {
    "src": "/images/products-2026/aerated-transport-tank.webp",
    "alt": "Thùng composite màu xanh có nắp, vòi xả và hệ ống sục khí",
    "label": "Thùng vận chuyển thủy sản",
    "width": 960,
    "height": 1280
  },
  "xe-gom-rac": {
    "src": "/images/products-2026/green-wheeled-bin.webp",
    "alt": "Thùng rác màu xanh lá có nắp và bánh xe tại xưởng",
    "label": "Thùng rác composite",
    "width": 960,
    "height": 1280
  },
  "composite-theo-yeu-cau": {
    "src": "/images/products-2026/blue-composite-boat.webp",
    "alt": "Thuyền composite màu xanh với các khoang và ghế ngồi",
    "label": "Sản phẩm tạo hình riêng",
    "width": 960,
    "height": 1280
  }
};

// Each editorial placement uses a distinct source photograph, separate from product covers.
export const editorialAssets = {
  "hero": {
    "src": "/images/products-2026/round-tanks-installation.webp",
    "alt": "Công nhân lắp ghép bể composite tròn màu xanh ngoài trời",
    "label": "Từ xưởng đến nơi lắp đặt",
    "width": 2000,
    "height": 1500
  },
  "bridge": {
    "src": "/images/products-2026/blue-tanks-loading.webp",
    "alt": "Bốc xếp bể composite màu xanh lên xe vận chuyển",
    "label": "Chuẩn bị bàn giao",
    "width": 1600,
    "height": 1200
  },
  "fit": {
    "src": "/images/products-2026/rectangular-tanks-workshop.webp",
    "alt": "Các bể composite chữ nhật màu xanh xếp trong xưởng",
    "label": "Nhiều quy cách sản xuất",
    "width": 1600,
    "height": 1200
  },
  "contact": {
    "src": "/images/products-2026/yellow-tank-detail.webp",
    "alt": "Bề mặt thùng composite màu vàng với vòi xả và ống dẫn",
    "label": "Chi tiết thành phẩm",
    "width": 1600,
    "height": 1200
  },
  "footer": {
    "src": "/images/products-2026/green-components-workshop.webp",
    "alt": "Các cấu kiện composite màu xanh lá trong nhà xưởng",
    "label": "Bên trong xưởng Thành Lợi",
    "width": 1600,
    "height": 1200
  },
  "story": {
    "src": "/images/products-2026/custom-shells-workshop.webp",
    "alt": "Các chi tiết composite nhiều hình dáng trong nhà xưởng",
    "label": "Tạo hình theo yêu cầu",
    "width": 1276,
    "height": 956
  },
  "gallery": [
    {
      "src": "/images/products-2026/blue-white-lidded-tanks.webp",
      "alt": "Thùng composite xanh và trắng có nắp mở tại xưởng",
      "label": "Kiểu dáng và kết cấu",
      "width": 1276,
      "height": 956
    },
    {
      "src": "/images/products-2026/pickup-blue-tank.webp",
      "alt": "Thùng composite xanh đặt trên xe bán tải màu cam",
      "label": "Phù hợp không gian vận chuyển",
      "width": 1600,
      "height": 1200
    },
    {
      "src": "/images/products-2026/white-tanks-yard.webp",
      "alt": "Các bồn composite trắng đặt tại khu vực ngoài trời",
      "label": "Thành phẩm tại xưởng",
      "width": 1200,
      "height": 1600
    }
  ]
} satisfies Record<string, CustomerProductAsset | CustomerProductAsset[]>;

export const additionalCustomerAssets: CustomerProductAsset[] = [
  {
    "src": "/images/products-2026/blue-long-tank-shell.webp",
    "alt": "Cấu kiện bồn dài màu xanh cùng nhiều cấu kiện composite tại xưởng",
    "label": "Cấu kiện dạng bồn dài",
    "width": 1200,
    "height": 1600
  },
  {
    "src": "/images/products-2026/blue-open-tanks-yard.webp",
    "alt": "Các bể composite xanh nhiều hình dạng trong sân xưởng",
    "label": "Bể hở nhiều kiểu dáng",
    "width": 1276,
    "height": 956
  },
  {
    "src": "/images/products-2026/white-double-lid-tank.webp",
    "alt": "Thùng composite trắng có hai nắp mở tại xưởng",
    "label": "Thùng hai nắp",
    "width": 960,
    "height": 1280
  },
  {
    "src": "/images/products-2026/blue-box-tank-front.webp",
    "alt": "Mặt trước thùng composite màu xanh đặt trong sân xưởng",
    "label": "Thùng dạng hộp",
    "width": 1200,
    "height": 1600
  }
];
