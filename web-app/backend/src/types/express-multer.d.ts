declare namespace Express {
	interface Request {
		file?: {
			buffer: Buffer;
			mimetype?: string;
			originalname?: string;
		};
	}
}