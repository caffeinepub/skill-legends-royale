import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CatalogEntry {
    id: string;
    order: bigint;
    name: string;
    imageUrl: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBranch(name: string, imageUrl: string): Promise<void>;
    addHero(name: string, imageUrl: string): Promise<void>;
    addItem(name: string, imageUrl: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBranch(id: string): Promise<void>;
    deleteHero(id: string): Promise<void>;
    deleteItem(id: string): Promise<void>;
    getBranches(): Promise<Array<CatalogEntry>>;
    getCallerUserRole(): Promise<UserRole>;
    getHeroes(): Promise<Array<CatalogEntry>>;
    getItems(): Promise<Array<CatalogEntry>>;
    initializeCatalogs(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    updateBranch(id: string, name: string, imageUrl: string): Promise<void>;
    updateHero(id: string, name: string, imageUrl: string): Promise<void>;
    updateItem(id: string, name: string, imageUrl: string): Promise<void>;
}
