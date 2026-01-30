import type { Schema, Struct } from '@strapi/strapi';

export interface BlackColors extends Struct.ComponentSchema {
  collectionName: 'components_black_colors';
  info: {
    displayName: 'colors';
  };
  attributes: {};
}

export interface SizeNameSize extends Struct.ComponentSchema {
  collectionName: 'components_size_name_sizes';
  info: {
    displayName: 'size';
  };
  attributes: {};
}

export interface WhiteColors extends Struct.ComponentSchema {
  collectionName: 'components_white_colors';
  info: {
    displayName: 'colors';
  };
  attributes: {};
}

export interface XlSizes extends Struct.ComponentSchema {
  collectionName: 'components_xl_sizes';
  info: {
    displayName: 'sizes';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'black.colors': BlackColors;
      'size-name.size': SizeNameSize;
      'white.colors': WhiteColors;
      'xl.sizes': XlSizes;
    }
  }
}
