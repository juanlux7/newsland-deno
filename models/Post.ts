export interface Post {

    title: {
        type: string,
        required: true
    },
    content: {
        type: string,
        required: true
    },
    img_url: {
        type: string,
        required: true
    },
    img_source: {
        type: string,
        required: false
    },
    category: {
        type: string,
        required: false,
        default: "None"
    },
    // it would be ideal to add multiple images for one post by including an extra field with img_1, img_2 etc
    created_at: {
        type: Date,
        required: false,
        default: null
    },
    author: {
        type: string,
        required: false
    }
}