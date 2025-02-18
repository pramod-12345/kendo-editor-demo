export const commonAttributes = () => {
    return {
        style: { default: null },
        class: { default: null },
        id: { default: null },
    };
};

export const hasAttrs = (attrs, exclude) => {
    for (const attr in attrs) {
        if (attr && attrs[ attr ] !== null && attr !== exclude) {
            return true;
        }
    }
    return false;
};

export const getAttrs = (attrs, exclude) => {
    const result = {};
    for (const attr in attrs) {
        if (attr && attrs[ attr ] !== null && attr !== exclude) {
            result[ attr ] = attrs[ attr ];
        }
    }
    return result;
};

export const getAttributes = (dom) => {
    const result = {};
    const attributes = dom.attributes;
    let attr;
    for (let i = 0; i < attributes.length; i++) {
        attr = attributes[ i ];
        result[ attr.name ] = attr.value;
    }

    return result;
};
