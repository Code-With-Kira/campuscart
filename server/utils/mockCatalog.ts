// DEMONSTRATION RECORDS, NOT AN IMPLEMENTED DATABASE.
// Names and field types follow the user's uploaded CampusCart ERD.
// 'ACTIVE'/'INACTIVE' are provisional mock values; the SQL ENUM is unresolved.
import type { Category, Product } from '../../app/types/catalog'

const oldDate = '2026-09-22T08:00:00+08:00'
const mk = (product_id: number, category_id: number, sku: string,
  product_name: string, description: string, price: string, stock_quantity: number,
  created_at: string = oldDate): Product => ({
    product_id, category_id, sku, product_name, description, price,
    stock_quantity, status: 'ACTIVE', created_at, updated_at: created_at,
  })
export const mockCategories: Category[] = [
  { category_id: 1, category_name: 'School Supplies', description: 'Everyday tools for studying and staying organized.', status: 'ACTIVE', created_at: oldDate, updated_at: oldDate },
  { category_id: 2, category_name: 'Tech Accessories', description: 'Useful gear for class, study, and creative projects.', status: 'ACTIVE', created_at: oldDate, updated_at: oldDate },
  { category_id: 3, category_name: 'Campus Merchandise', description: 'Campus-inspired everyday essentials and keepsakes.', status: 'ACTIVE', created_at: oldDate, updated_at: oldDate },
]
export const mockProducts: Product[] = [
  mk(101, 1, 'SCH-001', 'Study Notes Notebook', 'Hard-cover ruled notebook for lectures and reviews.', '129.00', 34),
  mk(102, 1, 'SCH-002', 'Color Study Pen Set', 'Set of colorful pens for note-taking and planning.', '89.00', 48, '2026-10-10T08:00:00+08:00'),
  mk(103, 1, 'SCH-003', 'Scientific Calculator', 'Handy calculator for academic exercises.', '549.00', 10),
  mk(104, 1, 'SCH-004', 'Desktop Organizer', 'Compact desk organizer for stationery and accessories.', '219.00', 8, '2026-10-14T08:00:00+08:00'),
  mk(201, 2, 'TEC-001', 'Wireless Study Mouse', 'Comfortable wireless mouse for laptop work.', '499.00', 21),
  mk(202, 2, 'TEC-002', 'Everyday Headphones', 'Lightweight over-ear headphones for focused study sessions.', '899.00', 15, '2026-10-12T08:00:00+08:00'),
  mk(203, 2, 'TEC-003', '32GB USB Flash Drive', 'Portable USB flash drive for projects and documents.', '349.00', 39),
  mk(204, 2, 'TEC-004', 'Foldable Laptop Stand', 'Portable stand that raises a laptop above the desk.', '429.00', 0, '2026-10-13T08:00:00+08:00'),
  mk(301, 3, 'MER-001', 'Campus Everyday Tote', 'Reusable everyday tote for books and daily essentials.', '269.00', 18, '2026-10-11T08:00:00+08:00'),
  mk(302, 3, 'MER-002', 'Reusable Campus Tumbler', 'Reusable bottle for everyday use.', '399.00', 12, '2026-10-15T08:00:00+08:00'),
  mk(303, 3, 'MER-003', 'Campus Comfort Tee', 'Everyday cotton t-shirt with a simple campus-inspired design.', '459.00', 17),
  mk(304, 3, 'MER-004', 'Classic ID Lanyard', 'Comfortable ID lanyard for campus life.', '99.00', 40, '2026-10-16T08:00:00+08:00'),
]
