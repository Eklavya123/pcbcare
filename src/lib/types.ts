export type Category = { id: string; name: string; slug: string; sort_order: number; created_at: string; image: string | null };
export type Product = {
  id: string; category_id: string; name: string; slug: string; description: string | null;
  images: string[]; sort_order: number; created_at: string; brands: string[];
  condition: "new" | "refurbished" | ""; motor_type: string | null;
  starting_price: string | number | null; keywords: string[];
};
export type Review = { id: string; target_type: "product" | "blog"; target_id: string; user_name: string; rating: number; comment: string | null; created_at: string };
export type ErrorCode = { id: string; appliance: string; brand: string; error_code: string; meaning: string; cause: string | null; how_to_fix: string; model_number: string | null; created_at: string };
export type SensorValue = { id: string; model_number: string; brand: string | null; appliance: string | null; title: string; description: string; pcb_type: string | null; room_sensor_value: string | null; coil_sensor_value: string | null; discharge_sensor_value: string | null; ambient_sensor_value: string | null; condenser_coil_sensor_value: string | null; linked_product_ids: string[]; image_url: string | null };
export type Remote = { id: string; model_number: string; brand: string | null; appliance: string | null; title: string | null; remote_image: string | null; remote_images: string[] | null; linked_product_ids: string[] };
