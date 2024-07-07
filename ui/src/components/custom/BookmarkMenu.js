import React from 'react'
import { Link } from 'react-router-dom'

const BookmarkMenu = () => {
  return (
    <div className="absolute top-0 left-4 -translate-y-1/2 space-x-3 z-10">
      <Link to="/dashboard" className="bg-secondary text-button-text border border-transparent py-2 px-4 text-sm rounded-md shadow-md font-medium transition-colors duration-300 ease-in-out hover:bg-accent">Home</Link>
      <Link to="/market" className="bg-secondary text-button-text border border-transparent py-2 px-4 text-sm rounded-md shadow-md font-medium transition-colors duration-300 ease-in-out hover:bg-accent">Market</Link>
      <Link to="/leaderboard" className="bg-secondary text-button-text border border-transparent py-2 px-4 text-sm rounded-md shadow-md font-medium transition-colors duration-300 ease-in-out hover:bg-accent">Leaderboard</Link>
    </div>
  )
}

export default BookmarkMenu
