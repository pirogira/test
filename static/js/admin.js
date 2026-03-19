document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sortable-blocks");
    if (!container) {
        return;
    }

    let dragged = null;

    const getOrder = () =>
        [...container.querySelectorAll(".block-card")].map((card) => Number(card.dataset.blockId));

    const persistOrder = async () => {
        try {
            const response = await fetch("/admin/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: getOrder() }),
            });
            if (!response.ok) {
                throw new Error("Cannot save order");
            }
        } catch (error) {
            console.error(error);
        }
    };

    container.querySelectorAll(".block-card").forEach((card) => {
        card.addEventListener("dragstart", () => {
            dragged = card;
            card.classList.add("is-dragging");
        });

        card.addEventListener("dragend", async () => {
            card.classList.remove("is-dragging");
            dragged = null;
            await persistOrder();
        });

        card.addEventListener("dragover", (event) => {
            event.preventDefault();
            if (!dragged || dragged === card) {
                return;
            }
            const rect = card.getBoundingClientRect();
            const shouldPlaceBefore = event.clientY < rect.top + rect.height / 2;
            container.insertBefore(dragged, shouldPlaceBefore ? card : card.nextSibling);
        });
    });
});
