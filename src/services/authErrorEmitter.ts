type AuthErrorListener = (error: { code: string; message: string }) => void;

const listeners: Set<AuthErrorListener> = new Set();

export const authErrorEmitter = {
	subscribe(listener: AuthErrorListener): () => void {
		listeners.add(listener);
		return () => { listeners.delete(listener); };
	},
	emit(error: { code: string; message: string }) {
		listeners.forEach((listener) => listener(error));
	},
};