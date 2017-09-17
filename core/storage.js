import * as virtualStorage from './virtualStorage';
import * as env from './env';

const storage = env.hasChromeStorage() ? env.getChromeStorage() : virtualStorage.create();

export default storage;
