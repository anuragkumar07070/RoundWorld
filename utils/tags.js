// Predefined tags with icons and colors
const TAG_OPTIONS = {
    beach: { icon: '🏖️', color: '#4fc3f7', bg: '#e1f5fe', label: 'Beach' },
    mountain: { icon: '⛰️', color: '#795548', bg: '#efebe9', label: 'Mountain' },
    desert: { icon: '🏜️', color: '#ffb74d', bg: '#fff3e0', label: 'Desert' },
    forest: { icon: '🌲', color: '#66bb6a', bg: '#e8f5e9', label: 'Forest' },
    lake: { icon: '🏞️', color: '#29b6f6', bg: '#e1f5fe', label: 'Lake' },
    city: { icon: '🏙️', color: '#78909c', bg: '#f5f5f5', label: 'City' },
    countryside: { icon: '🌾', color: '#8d6e63', bg: '#efebe9', label: 'Countryside' },
    luxury: { icon: '💎', color: '#ffd700', bg: '#fff9c4', label: 'Luxury' },
    budget: { icon: '💰', color: '#4caf50', bg: '#e8f5e9', label: 'Budget' },
    family: { icon: '👨‍👩‍👧‍👦', color: '#ff7043', bg: '#fbe9e7', label: 'Family' },
    romantic: { icon: '❤️', color: '#ef5350', bg: '#ffebee', label: 'Romantic' },
    adventure: { icon: '🧗', color: '#ff9800', bg: '#fff3e0', label: 'Adventure' },
    ski: { icon: '🎿', color: '#00acc1', bg: '#e0f7fa', label: 'Ski' },
    tropical: { icon: '🌴', color: '#26a69a', bg: '#e0f2f1', label: 'Tropical' },
    historical: { icon: '🏛️', color: '#8d6e63', bg: '#efebe9', label: 'Historical' },
    modern: { icon: '🏢', color: '#607d8b', bg: '#eceff1', label: 'Modern' },
};

// Get all available tags
const getAllTags = () => {
    return Object.keys(TAG_OPTIONS).map(key => ({
        value: key,
        label: TAG_OPTIONS[key].label,
        icon: TAG_OPTIONS[key].icon,
        color: TAG_OPTIONS[key].color
    }));
};

// Render tags for display
const renderTags = (tags) => {
    if (!tags || tags.length === 0) return '';
    
    return tags.map(tag => {
        const tagInfo = TAG_OPTIONS[tag];
        if (!tagInfo) return `<span class="tag">${tag}</span>`;
        
        return `
            <span class="tag" style="background: ${tagInfo.bg}; color: ${tagInfo.color};">
                ${tagInfo.icon} ${tagInfo.label}
            </span>
        `;
    }).join('');
};

// Auto-suggest tags based on listing data
const suggestTags = (listing) => {
    const suggestions = [];
    const title = listing.title.toLowerCase();
    const description = listing.description.toLowerCase();
    const location = listing.location.toLowerCase();
    
    const keywords = {
        beach: ['beach', 'coast', 'ocean', 'sea', 'sand', 'shore', 'surf'],
        mountain: ['mountain', 'hill', 'peak', 'alp', 'hike', 'trek'],
        desert: ['desert', 'dune', 'sahara', 'cactus', 'arid'],
        forest: ['forest', 'woods', 'tree', 'jungle', 'rainforest'],
        lake: ['lake', 'river', 'waterfront', 'water', 'stream'],
        city: ['city', 'downtown', 'urban', 'metro', 'skyscraper'],
        luxury: ['luxury', 'premium', 'exclusive', '5-star', 'deluxe'],
        budget: ['budget', 'affordable', 'cheap', 'economy', 'value'],
        family: ['family', 'kids', 'children', 'playground'],
        romantic: ['romantic', 'honeymoon', 'couple', 'anniversary'],
        adventure: ['adventure', 'explore', 'exciting', 'thrill'],
        ski: ['ski', 'snow', 'winter', 'slope', 'snowboard'],
        tropical: ['tropical', 'jungle', 'palm', 'rainforest', 'exotic'],
    };
    
    for (const [tag, words] of Object.entries(keywords)) {
        const matches = words.some(word => 
            title.includes(word) || description.includes(word) || location.includes(word)
        );
        if (matches) suggestions.push(tag);
    }
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
};

module.exports = {
    TAG_OPTIONS,
    getAllTags,
    renderTags,
    suggestTags
};