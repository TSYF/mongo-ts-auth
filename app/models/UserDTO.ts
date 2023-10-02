export class UserDTO {

    private password?: string;
    private accessToken: string;

    public constructor(
        private email: string
    ) {}

    public fill(data: Object): UserDTO {
        Object.entries(data).forEach(([key, value]: [string, unknown]) => {
            if (this.hasOwnProperty(key)) {
                this[key] ??= value;
            }
        });
        return this;
    }

    
    public getEmail(): string {
        return this.email;
    }
    
    public getPassword(): string {
        return this.password || '';
    }

    
    public setPassword(password: string) {
        this.password = password;
    }
    
}