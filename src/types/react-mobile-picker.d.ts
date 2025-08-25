declare module "react-mobile-picker" {
  import * as React from "react";

  export interface PickerValue {
    [name: string]: string;
  }

  export interface PickerProps {
    value: PickerValue;
    onChange: (value: PickerValue) => void;
    height?: number;
    itemHeight?: number;
    wheelMode?: "normal" | "infinite";
    className?: string;
    children?: React.ReactNode;
  }

  interface ColumnProps {
    name: string;
    children?: React.ReactNode;
  }

  interface ItemProps {
    value: string;
    children?: React.ReactNode;
  }

  const Picker: React.FC<PickerProps> & {
    Column: React.FC<ColumnProps>;
    Item: React.FC<ItemProps>;
  };

  export default Picker;
}
