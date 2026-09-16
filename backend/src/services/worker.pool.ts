export async function runWorkerPool<T, R>(
    items: T[],
    workerCount: number,
    worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);

    let nextIndex = 0;

    async function runWorker() {
        while (true) {
            const currentIndex = nextIndex++;

            if (currentIndex >= items.length) {
                return;
            }

            results[currentIndex] = await worker(
                items[currentIndex]!,
                currentIndex
            );
        }
    }

    const workers = Array.from(
        {
            length: Math.min(workerCount, items.length)
        },
        () => runWorker()
    );

    await Promise.all(workers);

    return results;
}