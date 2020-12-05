export interface User {

    name: string;
    username: string;
    email: string;
    password: string;
    isAdmin?: boolean;
}

export const users:User[] = [];