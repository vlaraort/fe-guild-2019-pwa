const SERVER_URL = 'http://192.168.43.209:3000';
const API_URL = `${SERVER_URL}/selfies`;

const dbPromise = idb.openDb('selfies-store', 1, upgradeDB => {
    if (!upgradeDB.objectStoreNames.contains('selfies')) {
        upgradeDB.createObjectStore('selfies', {keyPath: 'id'});
    }

    if (!upgradeDB.objectStoreNames.contains('sync-selfies')) {
        upgradeDB.createObjectStore('sync-selfies', {keyPath: 'id'});
    }
});

const writeData = (storeName, data) => {
    return dbPromise
        .then(db => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.put(data);
            return tx.complete;
        });
};

const readAllData = storeName => {
    return dbPromise
        .then(db => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            return store.getAll();
        });
};

const clearAllData = storeName => {
    return dbPromise
        .then(db => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.clear();
            return tx.complete;
        });
};

const deleteItemFromData = (storeName, id) => {
    dbPromise
        .then(db => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.delete(id);
            return tx.complete;
        })
        .then(() => console.log('Item deleted!'));
};

const dataURItoBlob= dataURI => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], {type: mimeString});
    return blob;
};