import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HeroFinder.css';  
import { useNavigate } from 'react-router-dom';

function HeroFinder() {
    const [searchInput, setSearchInput] = useState('');
    const [searchField, setSearchField] = useState('name');
    const [nResults, setNResults] = useState(10);
    const [superheroes, setSuperheroes] = useState([]);
    const [favoriteLists, setFavoriteLists] = useState([]);
    const [sortField, setSortField] = useState('name');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [listInfo, setListInfo] = useState([]);
    const [currentListName, setCurrentListName] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedHeroId, setSelectedHeroId] = useState(''); // Add this line
    const [nameSearch, setNameSearch] = useState('');
    const [raceSearch, setRaceSearch] = useState('');
    const [publisherSearch, setPublisherSearch] = useState('');
    const [powerSearch, setPowerSearch] = useState('');
    const [username, setUsername] = useState(localStorage.getItem('name'));
    const [userId, setuserId] = useState(localStorage.getItem('userId'));
    const [heroIdToDelete, setHeroIdToDelete] = useState('');
    const [publicLists, setPublicLists] = useState([]);
    const [publicListDetails, setPublicListDetails] = useState({});
    const [showPublicLists, setShowPublicLists] = useState(false);
    const [reviewListName, setReviewListName] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(5); // Default rating


    const navigate = useNavigate(); // Initialize navigate
        // Add a new state to track whether the list is public or private
    const [isListPublic, setIsListPublic] = useState(false);
    useEffect(() => {
        // Check if the user is logged in
        if (!localStorage.getItem('userId')) {
            // If not logged in, redirect to the login page
            navigate('/signin');
        }
        getListInfo();
    }, []);

    useEffect(() => {
        axios.get('api/lists/public-favorite-lists')
            .then(response => {
                setPublicLists(response.data.map(list => ({ ...list, showDetails: false })));
            })
            .catch(error => {
                console.error('Error fetching public lists:', error);
            });
    }, [])  

    const searchSuperheroes = () => {
        setIsLoading(true);
        let url = `api/superheroes/search?name=${encodeURIComponent(nameSearch)}&race=${encodeURIComponent(raceSearch)}&publisher=${encodeURIComponent(publisherSearch)}&power=${encodeURIComponent(powerSearch)}`;
        axios.get(url)
            .then(response => {
                return Promise.all(response.data.map(id => 
                    axios.get(`api/superheroes/${id}`)
                ));
            })
            .then(detailsResponses => {
                setSuperheroes(detailsResponses.map(res => res.data));
            })
            .catch(error => {
                console.error('Error during search:', error);
                setError('Error during search');
            })
            .finally(() => setIsLoading(false));
    };

            // Add input change handlers
        const handleNameChange = (e) => setNameSearch(e.target.value);
        const handleRaceChange = (e) => setRaceSearch(e.target.value);
        const handlePublisherChange = (e) => setPublisherSearch(e.target.value);
        const handlePowerChange = (e) => setPowerSearch(e.target.value);
    
    const toggleHeroDetails = (heroId) => {
        setSuperheroes(superheroes.map(hero => {
            if (hero._id === heroId) {
                return { ...hero, showDetails: !hero.showDetails };
            }
            return hero;
        }));
    };

    const postReview = () => {
        axios.post(`api/lists/favorite-lists/${reviewListName}/reviews`, {
          reviewerName: username,
          comment: reviewComment,
          rating: reviewRating,
        })
        .then(response => {
          console.log('Review posted:', response.data);
          // Reset review form or handle success
        })
        .catch(error => {
          console.error('Error posting review:', error);
          // Handle error
        });
      };
      

    const toggleHeroDetailsInPublicList = (heroId, listName) => {
        setPublicListDetails({
            ...publicListDetails,
            [listName]: {
                ...publicListDetails[listName],
                superheroes: publicListDetails[listName].superheroes.map(hero => {
                    if (hero._id === heroId) {
                        return { ...hero, showDetails: !hero.showDetails };
                    }
                    return hero;
                })
            }
        });
    };

    const togglePublicListDetails = listName => {
        const updatedPublicLists = publicLists.map(list => {
            if (list.listName === listName) {
                const showDetails = !list.showDetails;
                if (showDetails && !publicListDetails[listName]) {
                    // Fetch list details if not already fetched
                    Promise.all([
                        axios.get(`api/lists/favorite-lists/${listName}/superheroes/info`),
                        axios.get(`api/lists/favorite-lists/${listName}/reviews`)
                    ])
                    .then(([heroesResponse, reviewsResponse]) => {
                        setPublicListDetails({
                            ...publicListDetails,
                            [listName]: {
                                superheroes: heroesResponse.data,
                                reviews: reviewsResponse.data
                            }
                        });
                    })
                    .catch(error => {
                        console.error(`Error fetching details for list ${listName}:`, error);
                    });
                }
                return { ...list, showDetails };
            }
            return list;
        });
    
        setPublicLists(updatedPublicLists);
    };

    const clearSearchResults = () => {
        setSuperheroes([]);
        setError('');
        setSearchInput('');
    };

    const toggleFavoriteListHeroDetails = (heroId) => {
        setListInfo(listInfo.map(hero => {
            if (hero._id === heroId) {
                return { ...hero, showDetails: !hero.showDetails };
            }
            return hero;
        }));
    };
    
    const handleLogout = () => {
        // Clear user data from local storage
        localStorage.removeItem('name');
        localStorage.removeItem('userId');

        // Navigate to the main page or login page after logging out
        navigate('/signin');
    };

    
    const handleChangePassword = () => {
        // Navigate to the UpdatePassword page
        navigate('/updatepassword'); // Use the correct path for your UpdatePassword component
    };
    
    const getListInfo = () => {
        const userId = localStorage.getItem('userId'); // Get the user ID from local storage
        setIsLoading(true);
        axios.get(`api/lists/favorite-lists/${encodeURIComponent(currentListName)}/superheroes/info`, {
            params: { userId }, // Send userId as a query parameter

        })
            .then(response => {
                const superheroesWithDetails = response.data.map(hero => ({
                    ...hero,
                    showDetails: false // Initialize with showDetails as false
                }));
                setListInfo(superheroesWithDetails);
            })
            .catch(error => {
            
            })
            .finally(() => setIsLoading(false));
    };
    

    const renderSuperheroes = () => {
        return superheroes.map(hero => (
            <div className="hero" key={hero._id}>
                <div className="hero-name">{hero.name}</div>
                <div className="hero-publisher">Publisher: {hero.publisher}</div>
                <div className={`hero-details ${hero.showDetails ? 'show' : ''}`}>
                    <div>ID: {hero.id}</div>
                    <div>Gender: {hero.gender}</div>
                    <div>Eye color: {hero.eyeColor}</div>
                    <div>Race: {hero.race}</div>
                    <div>Hair color: {hero.hairColor}</div>
                    <div>Height: {hero.height} cm</div>
                    <div>Skin color: {hero.skinColor}</div>
                    <div>Alignment: {hero.alignment}</div>
                    <div>Weight: {hero.weight} kg</div>
                    <div>Powers: {hero.powers.join(', ')}</div>
                    <a
            href={`https://duckduckgo.com/?q=${encodeURIComponent(hero.name)}&ia=web`}
            target="_blank"
            rel="noopener noreferrer"
            className="duckduckgo-btn" // Add this class
        >
            DuckDuckGo
        </a>
    </div>
                <button 
                    className="toggle-details-btn" 
                    onClick={() => toggleHeroDetails(hero._id)}
                >
                    {hero.showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
        ));
    };

    const renderListInfo = () => {
        return listInfo.map(superhero => (
            <div key={superhero._id} className="hero">
                <div className="hero-name">{superhero.name}</div>
                <div className="hero-publisher">Publisher: {superhero.publisher}</div>
                <div className={`hero-details ${superhero.showDetails ? 'show' : ''}`}>
                    <div>ID: {superhero.id}</div>
                    <div>Gender: {superhero.gender}</div>
                    <div>Eye color: {superhero.eyeColor}</div>
                    <div>Race: {superhero.race}</div>
                    <div>Hair color: {superhero.hairColor}</div>
                    <div>Height: {superhero.height} cm</div>
                    <div>Skin color: {superhero.skinColor}</div>
                    <div>Alignment: {superhero.alignment}</div>
                    <div>Weight: {superhero.weight} kg</div>
                    <div>Powers: {Array.isArray(superhero.powers) ? superhero.powers.join(', ') : superhero.powers}</div>
                    {/* DuckDuckGo Search Link */}
                    <a href={`https://duckduckgo.com/?q=${encodeURIComponent(superhero.name)}&ia=web`} target="_blank" rel="noopener noreferrer">
                            DuckDuckGo
                        </a>
                </div>
                <button 
                    className="toggle-details-btn" 
                    onClick={() => toggleFavoriteListHeroDetails(superhero._id)}>
                    {superhero.showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
        ));
    };

    // Checkbox handler to update public status
    const handlePublicCheckboxChange = (e) => {
    setIsListPublic(e.target.checked);
    if (currentListName) {
        updateListPublicStatus(currentListName, e.target.checked);
    }
};

// Function to calculate the average rating
const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return "No ratings yet";

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    return averageRating.toFixed(1); // One decimal place
};


const renderPublicLists = () => {
    return publicLists.map(list => (
        <div key={list.listName} className="public-list">
            <h3>{list.listName}</h3>
            <p className="creator">Created by: {list.userName}</p>
            <p className="created-at">Created at: {new Date(list.createdAt).toLocaleString()}</p>
            <p className="last-updated">Last updated: {new Date(list.updatedAt).toLocaleString()}</p>
            <button onClick={() => togglePublicListDetails(list.listName)}>
                {list.showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            {list.showDetails && publicListDetails[list.listName] && (
                <div>
                    {publicListDetails[list.listName].superheroes.map(hero => (
                        <div key={hero._id} className="hero">
                            <div className="hero-name">{hero.name}</div>
                            <div className="hero-publisher">Publisher: {hero.publisher}</div>
                            <button onClick={() => toggleHeroDetailsInPublicList(hero._id, list.listName)}>
                                {hero.showDetails ? 'Hide Details' : 'Show Details'}
                            </button>
                            {hero.showDetails && (
                                <div className={`hero-details ${hero.showDetails ? 'show' : ''}`}>
                                     <div>ID: {hero.id}</div>
                                     <div>Gender: {hero.gender}</div>
                                     <div>Eye color: {hero.eyeColor}</div>
                                    <div>Race: {hero.race}</div>
                                     <div>Hair color: {hero.hairColor}</div>
                                     <div>Height: {hero.height} cm</div>
                                     <div>Skin color: {hero.skinColor}</div>
                                     <div>Alignment: {hero.alignment}</div>
                                     <div>Weight: {hero.weight} kg</div>
                                     <div>Powers: {Array.isArray(hero.powers) ? hero.powers.join(', ') : hero.powers}</div>
                                     {/* DuckDuckGo Search Link */}
                                     <a
            href={`https://duckduckgo.com/?q=${encodeURIComponent(hero.name)}&ia=web`}
            target="_blank"
            rel="noopener noreferrer"
            className="duckduckgo-btn" // Add this class
        >
            DuckDuckGo
        </a>
    </div>
                            )}
                        </div>
                    ))}
                    <div className="list-reviews">
                        <h4>Reviews:</h4>
                        {publicListDetails[list.listName].reviews.map((review, index) => (
                            <div key={index} className="review">
                                <p><strong>{review.reviewerName}</strong>: {review.comment} ({review.rating}/5)</p>
                                <p>Reviewed on: {new Date(review.createdAt).toLocaleString()}</p>
                            </div>
                        ))}
                        {/* Displaying the average rating */}
                       <div class = 'averagerating'> <p>Average Rating: {calculateAverageRating(publicListDetails[list.listName].reviews)}</p> </div>
                    </div>
                </div>
            )}
        </div>
    ));
};



const fetchLists = () => {
    const userId = localStorage.getItem('userId'); // Get user ID from local storage
    axios.get('api/lists/favorite-lists', {
        params: { userId } // Send userId as a query parameter
    })
    .then(response => {
        // Each list item will have 'createdAt' and 'updatedAt' fields
        console.log(response.data);
    })
    .then(response => {
        setFavoriteLists(response.data);
    })
    .catch(error => {
            });
    };
    
   
    const createNewList = (listName) => {
        const userId = localStorage.getItem('userId'); // Get user ID from local storage
        const userName = localStorage.getItem('name')
        axios.post('api/lists/favorite-lists', {
            listName,
            isPublic: isListPublic,
            userId ,// Send userId in the body of the request
            userName
    })
          .then(() => {
                fetchLists();
                setSuccessMessage('List created successfully!');
                setError('');
            })
            .catch(error => {
                console.error('Error creating list:', error);
                setError('Error creating list');
                setSuccessMessage('');
            });
    };

    
// New function to update list's public status
const updateListPublicStatus = (listName, newStatus) => {
    axios.put(`api/lists/favorite-lists/${listName}/update-status`, { isPublic: newStatus })
        .then(() => {
            fetchLists();
            setSuccessMessage(`List "${listName}" public status updated successfully!`);
            setError('');
        })
        .catch(error => {
            console.error('Error updating list public status:', error);
            setError('Error updating list public status');
        });
};

const deleteHeroFromList = () => {
    const userId = localStorage.getItem('userId'); // Get user ID from local storage
    axios.delete(`api/lists/favorite-lists/${currentListName}/superheroes/${selectedHeroId}`, {
        data: { userId } // Send userId in the body of the request
    })
    .then(() => {
        getListInfo(); // Refresh list info after deletion
        setSuccessMessage('Hero removed from list successfully!');
        setError('');
    })
    .catch(error => {
        console.error('Error removing hero from list:', error);
        setError('Error removing hero from list');
    });
};
    
    const addHeroToList = (heroId) => {
        // Convert heroId to an integer
        const heroIdInt = parseInt(heroId, 10);
    
        // Check if the conversion resulted in a valid number
        if (isNaN(heroIdInt)) {
            setError('Invalid Hero ID. Please enter a valid number.');
            return;
        }
    
        if (!currentListName) {
            setError('No list selected');
            return;
        }
        const userId = localStorage.getItem('userId'); // Get user ID from local storage
        axios.put(`api/lists/favorite-lists/${currentListName}`, {
            superheroIds: [heroIdInt],
            userId // Send userId in the body of the request
        })
            .then(() => {
                getListInfo();
                setSelectedHeroId(''); // Clear the selected hero ID
            })
            .then(() => {
                getListInfo();
                setSelectedHeroId('');
                setSuccessMessage('Hero added to list successfully!');
                setError('');
            })
            
            .catch(error => {
                console.error('Error adding hero to list:', error);
                setError('Error adding hero to list');
            });
    };
    
    
    const deleteList = (listName) => {
        const userId = localStorage.getItem('userId'); // Get user ID from local storage
        axios.delete(`api/lists/favorite-lists/${listName}`, {
            data: { userId } // Send userId in the body of the request for DELETE
        })
        .then(() => {
                fetchLists();
                if (currentListName === listName) {
                    setCurrentListName('');
                    setListInfo([]);
                }
            })
            .then(() => {
                fetchLists();
                setCurrentListName('');
                setListInfo([]);
                setSuccessMessage('List deleted successfully!');
                setError('');
            })
            .catch(error => {
                console.error('Error deleting list:', error);
                setError('Error deleting list');
            });
    };
    
    // Call getListInfo when the user selects a list
    // This can be done with a button or automatically on selection change based on your UX preference
    
    

    return (
        
        <div>
            
            <h2>Welcome, {username}!</h2>


            <button onClick={handleLogout} className="button-blue">Log Out</button>
            <button onClick={handleChangePassword} className="button-blue">Change Password</button>
            <div className="section-separator"></div> {/* Add this line for spacing */}


    
            {/* Search Inputs Section */}
            <div className="search-section">
                <input type="text" value={nameSearch} onChange={handleNameChange} placeholder="Search by Name" />
                <input type="text" value={raceSearch} onChange={handleRaceChange} placeholder="Search by Race" />
                <input type="text" value={publisherSearch} onChange={handlePublisherChange} placeholder="Search by Publisher" />
                <input type="text" value={powerSearch} onChange={handlePowerChange} placeholder="Search by Power" />
                <button onClick={searchSuperheroes}  className="button-blue">Search</button>
                <button onClick={clearSearchResults }  className="button-blue"> Clear Search Results </button> {/* Added button */}
            </div>
    
            {/* Loading and Error Messages */}
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
    
            {/* Display Superheroes */}
            <div className="hero-finder-container">
                {renderSuperheroes()}
            </div>

            <div className="section-separator"></div> {/* Add this line for spacing */}

    
            {/* List Management Section */}
            <div>
                <h3>MAKE YOUR OWN LISTS </h3>
                <input type="text" placeholder="New List Name" value={currentListName} onChange={(e) => setCurrentListName(e.target.value)} />
                <button onClick={() => createNewList(currentListName)}  className="button-blue" >Create New List</button>
    
                <input type="checkbox" checked={isListPublic} onChange={handlePublicCheckboxChange} />
                <label>Make this list public</label>
                <button onClick={getListInfo}  className="button-blue" >Get List Info</button>
    
                {listInfo.length > 0 && (
                    <button onClick={() => deleteList(currentListName)}  className="button-blue" >Delete List</button>
                )}
                <div>
                    <input type="text" placeholder="Hero ID to Add/Remove" value={selectedHeroId} onChange={(e) => setSelectedHeroId(e.target.value)} />
                    <button onClick={() => addHeroToList(selectedHeroId)}  className="button-blue" >Add Hero to List</button>
                    <button onClick={deleteHeroFromList}  className="button-blue" >Remove Hero from List</button>
                </div>
            </div>
                    
            {/* Display Lists and Their Info */}
            <div className="hero-finder-container">
                {renderListInfo()}
            </div>
            <div className="section-separator"></div> {/* Add this line for spacing */}

            <h3>SEE EVERYONE'S LISTS</h3>
            {/* Button to toggle public lists visibility */}
            <button onClick={() => setShowPublicLists(!showPublicLists)}>
                {showPublicLists ? 'Hide Public Lists' : 'Show Public Lists'}
            </button>
    
            {/* Conditionally Display Public Lists */}
            {showPublicLists && (
                <div className="public-lists-container">
                    {renderPublicLists()}
                </div>
            )}

<div className="section-separator"></div> {/* Add this line for spacing */}

            <div className="review-section">
  <h3>LEAVE A REVIEW</h3>
  <input
    type="text"
    value={reviewListName}
    onChange={(e) => setReviewListName(e.target.value)}
    placeholder="List Name"
  />
  <textarea
    value={reviewComment}
    onChange={(e) => setReviewComment(e.target.value)}
    placeholder="Your Review"
  />
  <input
    type="number"
    value={reviewRating}
    onChange={(e) => setReviewRating(e.target.value)}
    min="1"
    max="5"
    placeholder="Rating (1-5)"
  />
  <button onClick={postReview}  className="button-blue" >Submit Review</button>
</div>

        </div>

        
    );
            }
export default HeroFinder;
