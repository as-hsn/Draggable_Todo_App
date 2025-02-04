export type Id = string | number;

export type Column ={
    id: Id;
    title: string;
    isDefault?: boolean;
    order?: number; 
}

export type Task = {
    id: Id;
    columnId: Id;
    content: string;
    order?: number;
}