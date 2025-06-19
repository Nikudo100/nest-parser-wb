export type WBProduct = {
  id: number;

  // это одно и то же
  imtId: number;
  // это одно и то же
  root:number;

  name?: string;
  brand?: string;
  supplier?: string;
  pics?:any;
  supplierId?: number;
  supplierRating?: number;
  rating?: number;
  reviewRating?: number;
  feedbacks?: number;
  totalQuantity: number;
  colors?: any;
  sizes: {
    name?: string;
    rank?: number;
    optionId: number;
    stocks: {
      wh: number;
      dtype: number;
      dist: number;
      qty: number;
      priority: number;
      time1: number;
      time2: number;
    }[];
    price?: {
      total: number;
    };
  }[];
};