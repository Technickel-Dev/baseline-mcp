export const resultOrEmptyText = (results, emptyMessage) => {
    if (results.length === 0) {
        return {
            content: [{ type: "text", text: emptyMessage }],
        };
    }
    return { content: [{ type: "text", text: JSON.stringify(results) }] };
};
