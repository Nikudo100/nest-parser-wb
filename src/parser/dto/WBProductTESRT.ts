export type WBProduct = {
  id: number;

  // альтернативные идентификаторы
  imtId: number;
  root: number;

  name?: string;
  brand?: string;
  brandId?: number;
  siteBrandId?: number;

  supplier?: string;
  supplierId?: number;
  supplierRating?: number;
  supplierFlags?: number;

  pics?: any;

  rating?: number;
  reviewRating?: number;
  nmReviewRating?: number;

  feedbacks?: number;
  nmFeedbacks?: number;

  totalQuantity?: number;
  volume?: number;

  viewFlags?: number;

  colors?: {
    name: string;
    id: number;
  }[];

  subjectId?: number;
  subjectParentId?: number;

  entity?: string;
  matchId?: number;

  time1?: number;
  time2?: number;
  wh?: number;
  dtype?: number;
  dist?: number;

  sizes: {
    name?: string;
    origName?: string;
    rank?: number;
    optionId: number;
    wh?: number;
    time1?: number;
    time2?: number;
    dtype?: number;
    price?: {
      basic?: number;
      product?: number;
      total: number;
      logistics?: number;
      return?: number;
    };
    saleConditions?: number;
    payload?: string;
    stocks: {
      wh: number;
      dtype: number;
      dist: number;
      qty: number;
      priority: number;
      time1: number;
      time2: number;
    }[];
  }[];

  logs?: string;

  meta?: {
    tokens?: string[];
    presetId?: number;
  };
};