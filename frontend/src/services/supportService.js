import api from "../api/api";

export const subscribeToUpdates = async (email) => {
    const response = await api.post("/support/subscribe", { email });
    return response.data;
};

export const submitSupportForm = async ({
    name,
    email,
    subject,
    message,
    topic,
}) => {
    const response = await api.post("/support/contact", {
        name,
        email,
        subject,
        message,
        topic,
    });
    return response.data;
};
