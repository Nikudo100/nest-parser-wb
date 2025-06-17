// @deprecated

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';


export class OptionDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  is_variable?: boolean;

  @IsOptional()
  @IsNumber()
  charc_type?: number;

  @IsOptional()
  @IsArray()
  variable_value_IDs?: number[];

  @IsOptional()
  @IsArray()
  variable_values?: string[];
}

class CertificateDto {
  @IsBoolean()
  verified: boolean;
}

class FullColorDto {
  @IsNumber()
  nm_id: number;
}

class SellingDto {
  @IsString()
  brand_name: string;

  @IsString()
  brand_hash: string;

  @IsNumber()
  supplier_id: number;
}

class MediaDto {
  @IsNumber()
  photo_count: number;
}

class DataDto {
  @IsNumber()
  subject_id: number;

  @IsNumber()
  subject_root_id: number;

  @IsArray()
  @Type(() => Number)
  chrt_ids: number[];

  @IsString()
  tech_size: string;
}

export class GroupedOptionDto {
  @IsString()
  group_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}

export class ProductCardDto {
  @IsNumber()
  imt_id: number;

  @IsNumber()
  nm_id: number;

  @IsOptional()
  @IsBoolean()
  has_rich?: boolean;

  @IsOptional()
  @IsString()
  imt_name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  subj_name?: string;

  @IsOptional()
  @IsString()
  subj_root_name?: string;

  @IsOptional()
  @IsString()
  vendor_code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CertificateDto)
  certificate?: CertificateDto;

  @IsOptional()
  @IsString()
  nm_colors_names?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  colors?: number[];

  @IsOptional()
  @IsString()
  contents?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FullColorDto)
  full_colors?: FullColorDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SellingDto)
  selling?: SellingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaDto)
  media?: MediaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DataDto)
  data?: DataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupedOptionDto)
  grouped_options: GroupedOptionDto[];
}
