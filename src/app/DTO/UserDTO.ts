export class UserDTO {
    public constructor(
        public _id?: string,
        public email?: string,
        public password?: string,
        public accessToken?: string,
        public refreshToken?: string,
        public image?: string
    ) {}
}