//Common functions that is to be shared between different components across the React Application 

//Parse date string and return it in time ago format, like 2d ago, 3w ago, 1y ago etc.
const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    const years = Math.round(weeks / 52);

    if (seconds < 60) 
    return 'Just now';
    if (minutes < 60) 
    return `${minutes}m ago`;
    if (hours < 24) 
    return `${hours}h ago`;
    if (days < 7) 
    return `${days}d ago`;
    if (weeks < 4) 
    return `${weeks}w ago`;
    //else
    return `${years}y ago`;
  };

// Format the date type value as DDMMYYYY format
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UK',
        {year: 'numeric', month: 'short', day: 'numeric'});
}

module.exports = {getTimeAgo, formatDate}