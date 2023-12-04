document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchField = document.getElementById('search-field');
    const resultsContainer = document.getElementById('results');
    const newListButton = document.getElementById('new-list-button');
    const newListInput = document.getElementById('new-list-input');
    const addToListButton = document.getElementById('add-to-list-button');
    const listNameInput = document.getElementById('list-name-input');
    const heroIdInput = document.getElementById('hero-id-input'); // You'll need an input to specify which hero to add
    const nresults = document.getElementById('n')
    // Reference to the sort button and sort field
    const sortButton = document.getElementById('sort-button');
    const sortField = document.getElementById('sort-field');
    fetchFavoriteLists();
    var sortResult = []

      // Add event listener for the sort button
      sortButton.addEventListener('click', function() {
        const field = sortField.value; // Convert to lowercase to match your data keys
        sortSuperheroes(field);
      });

      document.getElementById('delete-list-button').addEventListener('click', function(event) {
        event.preventDefault(); 
        const listName = document.getElementById('delete-list-input').value;
        deleteList(listName);
    });

      // Add event listener for the 'Get List Info' button
      const getListButton = document.getElementById('get-list-button');
      getListButton.addEventListener('click', function() {
          const listName = document.getElementById('get-list-input').value;
          getListInfo(listName);

      });

       // Function to sort superheroes
    function sortSuperheroes(field) {
      const fieldValue = field;
    if (fieldValue === 'power') {
        sortResult.sort((a, b) => {
            const numPowersA = a.powers ? a.powers.length : 0;
            const numPowersB = b.powers ? b.powers.length : 0;
            return numPowersB - numPowersA;
        });
    }
    else{
        sortResult.sort((a, b) => {
          console.log(fieldValue)
            const fieldA = a[fieldValue].toString().toLowerCase();
            const fieldB = b[fieldValue].toString().toLowerCase();
            return fieldA.localeCompare(fieldB);
        });
    }
    // Display the sorted data
    displaySuperheroes(sortResult);

    }
    // Function to display superheroes
function displaySuperheroes(superheroes) {
    resultsContainer.innerHTML = ''; // Clear previous results

    superheroes.forEach(hero => {
        const heroElement = document.createElement('div');
        heroElement.className = 'hero';

        // Create and append the hero properties
        heroElement.innerHTML = `
            <div>ID: ${hero.id}</div>
            <div>Name: ${hero.name}</div>
            <div>Gender: ${hero.Gender}</div>
            <div>Eye color: ${hero['Eye color']}</div>
            <div>Race: ${hero.Race}</div>
            <div>Hair color: ${hero['Hair color']}</div>
            <div>Height: ${hero.Height} cm</div>
            <div>Publisher: ${hero.Publisher}</div>
            <div>Skin color: ${hero['Skin color']}</div>
            <div>Alignment: ${hero.Alignment}</div>
            <div>Weight: ${hero.Weight} kg</div>
            <div>Powers: ${Array.isArray(hero.powers) ? hero.powers.join(', ') : hero.powers}<div>
        `;
        resultsContainer.appendChild(heroElement);
    });
}
    
      // Function to get and display the list information
    function getListInfo(listName) {
        // Clear the search results container
        resultsContainer.innerHTML = '';
      sortResult = []
        fetch(`/lists/favorite-lists/${encodeURIComponent(listName)}/superheroes/info`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(superheroes => {
            const superheroesList = document.getElementById('superheroInfoContainer');
            superheroesList.innerHTML = ''; // Clear existing superhero info
            sortResult = superheroes
            superheroes.forEach(superhero => {
                const superheroDiv = document.createElement('div');
                superheroDiv.classList.add('superheroInfo');
      
                superheroDiv.innerHTML = `
                    ID: ${superhero.id}<br>
                    Name: ${superhero.name}<br>
                    Gender: ${superhero.Gender}<br>
                    Eye color: ${superhero['Eye color']}<br>
                    Race: ${superhero.Race}<br>
                    Hair color: ${superhero['Hair color']}<br>
                    Height: ${superhero.Height}<br>
                    Publisher: ${superhero.Publisher}<br>
                    Skin color: ${superhero['Skin color']}<br>
                    Alignment: ${superhero.Alignment}<br>
                    Weight: ${superhero.Weight}<br>
                    Powers: ${superhero.powers.join(', ')}<br>
                `;
      
                resultsContainer.appendChild(superheroDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching list info:', error);
        });
    }

    // Function to create a new favorite list
    newListButton.addEventListener('click', function() {
        const listName = newListInput.value;
        createNewList(listName);
      });
  
      // Function to add a hero to a favorite list
      addToListButton.addEventListener('click', function() {
        const listName = listNameInput.value;
        const heroId = heroIdInput.value;
        addHeroToList(listName, heroId);
      });

      function fetchFavoriteLists() {
        fetch('/lists/favorite-lists')
        .then(response => response.json())
        .then(lists => {
            displayFavoriteLists(lists);
        })
        .catch(error => {
            console.error('Error fetching favorite lists:', error);
        });
    }
  
      // Function to create a new list
      function createNewList(listName) {
        fetch('/lists/favorite-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ listName: listName })
        })
        .then(response => response.text())
        .then(result => {
          alert(result); // Display the result to the user
        })
        .catch(error => {
          console.error('Error creating new list:', error);
        })
        .then(() => fetchFavoriteLists())
        
      }
        // Function to delete a list
        function deleteList(listName) {
          sortResult = []
            fetch(`/lists/favorite-lists/${encodeURIComponent(listName)}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(result => {
                alert(result);
            })
            .catch(error => {
                console.error('Error deleting list:', error);
            });

        }
        

      // Function to add a hero to a list
      function addHeroToList(listName, heroId) {
        fetch(`/lists/favorite-lists/${encodeURIComponent(listName)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ superheroIds: [parseInt(heroId)] }) // Assuming superheroIds expects an array
        })
        .then(response => response.text())
        .then(result => {
          alert(result); // Display the result to the user
        })
        .catch(error => {
          console.error('Error adding hero to list:', error);
        })
        .then(() => fetchFavoriteLists());
      }
      
  
      searchButton.addEventListener('click', function() {
        const query = searchInput.value;
        const field = searchField.value === 'powers' ? 'power' : searchField.value; // Change 'powers' to 'power'
        const nresultsvalue = nresults.value;
        searchSuperheroes(query, field, nresultsvalue);
      });
    
    function searchSuperheroes(query, field, n) {
        sortResult = []
      // Adjust the URL based on whether we're searching for powers or other attributes
      let url = `/api/search?field=${encodeURIComponent(field)}&query=${encodeURIComponent(query)}&n=${n}`;
      fetch(url)
      .then(response => response.json())
      .then(ids => {
          const fetchPromises = ids.map(id => {
              const superheroPromise = fetch(`/superheroes/${id}`).then(response => response.json());
              const powersPromise = fetch(`/superheroes/${id}/powers`).then(response => response.json());

              return Promise.all([superheroPromise, powersPromise])
                  .then(data => {
                      const [superhero, powers] = data;
                      superhero.powers = powers; 
                      return superhero;
                  });
          });
          return Promise.all(fetchPromises);
      })
      .then(data => {
        sortResult = data
          displaySuperheroes(data);
      })
      .catch(error => console.error(error));
    }
});