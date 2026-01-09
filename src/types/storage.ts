export interface DBSchema {
	name: string;
	version: number;
	stores: {
		recordings: {
			keyPath: string;
			autoIncrement: boolean;
			indexes: Array<{
				name: string;
				keyPath: string;
				options: { unique: boolean };
			}>;
		};
	};
}

export interface ValidationError {
	field: "name" | "events" | "version";
	message: string;
	constraint: string;
}

export interface StorageQuota {
	used: number;
	available: number;
	percentUsed: number;
}

export interface IndexedDBResult<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export const DB_SCHEMA: DBSchema = {
	name: "visual-reactivity-db",
	version: 1,
	stores: {
		recordings: {
			keyPath: "id",
			autoIncrement: true,
			indexes: [
				{
					name: "name",
					keyPath: "name",
					options: { unique: true },
				},
				{
					name: "dateCreated",
					keyPath: "dateCreated",
					options: { unique: false },
				},
			],
		},
	},
};
