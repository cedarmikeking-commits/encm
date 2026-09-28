export enum ClientType {
    MANAGEMENT,
    WORKER,
    LEARNER,

}
export interface Application {
    id: string;
    clientName: string;
    clientId: string;
    clientVersion: string;
    clientDesc: string;
    clientType: ClientType;
    status: Status;
    shelfType: Status;
    moduleCount: number;
    createdTime: string;
    updatedTime: string;
    webServerRedirectUri: string;
    apiEndpoint: string;
    devTeam: string;
}
export interface ModuleType {
    id: string;
    clientId: string;
    parentId: string | null;
    code: string;
    name: string;
    alias: string;
    path: string;
    source: string;
    sort: number;
    category: number;
    count: number;
    children: ModuleType[];
}
export interface ApplicationDetail extends Application {
    // Additional fields for application detail can be added here
    moduleList: Array<ModuleType>;
}


export interface Authorization {
    id: string;
    roleName: string;
    roleType: 1 | 2;
    clientList: (Application & { menuCount: number })[];
    totalModuleCount: number;
    totalMenuCount: number;

}

export interface RolePermissionAssignment {
    roleId: string;
    permissionIds: string[];
}
