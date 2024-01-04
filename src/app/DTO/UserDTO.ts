export class UserDTO {
    public constructor(
        public readonly uid?: string,
        public readonly email?: string,
        public readonly password?: string,
        public readonly accessToken?: string,
        public readonly refreshToken?: string,
        private readonly image?: string
    ) {}
}