interface IUserModel {
    user: {
        id: number;
        userName: string;
        email: string;
        diskSpace?: string | number;
        usedSpace?: string | number;
        avatar?: string | null;
        role?: string;
        isActivated?: boolean;
    };
    token: string;
    refreshToken: string;
}

export class UserDto {
    user: {
        id: number;
        userName: string;
        email: string;
        diskSpace: any;
        usedSpace: any;
        avatar: string;
        role: string;
        isActivated: boolean;
    };
    token: string;
    refreshToken: string;

    constructor(model: IUserModel) {
        const { user, token, refreshToken } = model;

        this.user = {
            id: user.id,
            userName: user.userName,
            email: user.email,
            diskSpace: user.diskSpace,
            usedSpace: user.usedSpace,
            avatar: user.avatar || "",
            role: user.role || "USER",
            isActivated: user.isActivated || false,
        };

        this.token = token;
        this.refreshToken = refreshToken;
    }
}
