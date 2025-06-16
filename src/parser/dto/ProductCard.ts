import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class Option {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  isVariable?: boolean;

  @IsNumber()
  charcType: number;

  @IsOptional()
  @IsArray()
  variableValueIDs?: number[];

  @IsOptional()
  @IsArray()
  variableValues?: string[];
}

class Certificate {
  @IsBoolean()
  verified: boolean;
}

class FullColor {
  @IsNumber()
  nmId: number;
}

class Selling {
  @IsString()
  brandName: string;

  @IsString()
  brandHash: string;

  @IsNumber()
  supplierId: number;
}

class Media {
  @IsNumber()
  photoCount: number;
}

class Data {
  @Expose({ name: 'subject_id' })
  @IsNumber()
  subjectId: number;

  @Expose({ name: 'subject_root_id' })
  @IsNumber()
  subjectRootId: number;

  @Expose({ name: 'chrt_ids' })
  @IsArray()
  chrtIds: number[];

  @Expose({ name: 'tech_size' })
  @IsString()
  techSize: string;
}

class GroupedOption {
  @IsString()
  groupName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Option)
  options: Option[];
}

export class ProductCard {
  @Expose({ name: 'imt_id' })
  @IsNumber()
  imtId: number;

  @Expose({ name: 'nm_id' })
  @IsNumber()
  nmId: number;

  @Expose({ name: 'has_rich' })
  @IsBoolean()
  hasRich: boolean;

  @Expose({ name: 'imt_name' })
  @IsString()
  imtName: string;
 
  @IsString()
  slug: string;

  @Expose({ name: 'subj_name' })
  @IsString()
  subjName: string;

  @Expose({ name: 'subj_root_name' })
  @IsString()
  subjRootName: string;

  @Expose({ name: 'vendor_code' })
  @IsString()
  vendorCode: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Option)
  options: Option[];

  @ValidateNested()
  @Type(() => Certificate)
  certificate: Certificate;

  @Expose({ name: 'nm_colors_names' })
  @IsString()
  nmColorsNames: string;

  @IsArray()
  colors: number[];

  @IsOptional()
  @IsArray()
  sizes?: number[];

  @IsString()
  contents: string;

  @Expose({ name: 'full_colors' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FullColor)
  fullColors: FullColor[];

  @ValidateNested()
  @Type(() => Selling)
  selling: Selling;

  @ValidateNested()
  @Type(() => Media)
  media: Media;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Data)
  data: Data[];

  @Expose({ name: 'grouped_options' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupedOption)
  groupedOptions?: GroupedOption[];
}
