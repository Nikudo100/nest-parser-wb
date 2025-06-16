export type ProductCard = {
    imtId: number;
    nmId: number;
    hasRich: boolean;
    imtName: string;
    slug: string;
    subjName: string;
    subjRootName: string;
    vendorCode: string;
    description: string;
    options: Array<{
        name: string;
        value: string;
        isVariable?: boolean;
        charcType: number;
        variableValueIDs?: number[];
        variableValues?: string[];
    }>;
    certificate: {
        verified: boolean;
    };
    nmColorsNames: string;
    colors: number[];
    contents: string;
    fullColors: Array<{
        nmId: number;
    }>;
    selling: {
        brandName: string;
        brandHash: string;
        supplierId: number;
    };
    media: {
        photoCount: number;
    };
    data: {
        subjectId: number;
        subjectRootId: number;
        chrtIds: number[];
        techSize: string;
    };
    groupedOptions: Array<{
        groupName: string;
        options: Array<{
            name: string;
            value: string;
            isVariable?: boolean;
            charcType: number;
            variableValueIDs?: number[];
            variableValues?: string[];
        }>;
    }>;
}