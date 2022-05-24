const solveButton = document.querySelector('[data-action="solveBoard"]');
const validateButton = document.querySelector('[data-action="validateBoard"]');
const resetButton = document.querySelector('[data-action="resetBoard"]');
const sudokuControls = document.querySelector('.sudoku-controls');
const userInputs = document.querySelectorAll('input');

let isSolved = false;

const emptyBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const originalBoard = [
  [8, 0, 0, 4, 0, 6, 0, 0, 7],
  [0, 0, 0, 0, 0, 0, 4, 0, 0],
  [0, 1, 0, 0, 0, 0, 6, 5, 0],
  [5, 0, 9, 0, 3, 0, 7, 8, 0],
  [0, 0, 0, 0, 7, 0, 0, 0, 0],
  [0, 4, 8, 0, 2, 0, 1, 0, 3],
  [0, 5, 2, 0, 0, 0, 0, 9, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 9, 0, 2, 0, 0, 5],
];

function populateBoardUI(board) {
  for (var row = 0; row < 9; row++) {
    for (var column = 0; column < 9; column++) {
      currentSquare = document.getElementById('' + row + column);
      // If the current square does not contain zero, disable the input so the
      // user can't change it
      if (board[row][column] !== 0) {
        currentSquare.value = board[row][column];
        currentSquare.disabled = true;
      } else {
        currentSquare.value = '';
        currentSquare.disabled = false;
      }
    }
  }
}

function getCurrentStateOfBoardFromUI() {
  // Initialise an empty 9x9 board array
  let board = Array.from(emptyBoard);

  for (var row = 0; row < 9; row++) {
    for (var column = 0; column < 9; column++) {
      currentSquare = document.getElementById('' + row + column);
      // We can't work with empty strings, so set them to 0
      if (currentSquare.value === '') {
        board[row][column] = 0;
      } else {
        board[row][column] = parseInt(currentSquare.value);
      }
    }
  }

  return board;
}

function updateUI() {
  // Removes all the added styles on reset
  userInputs.forEach(function (userInput) {
    userInput.classList.remove('invalid');
  });

  // Removes the solved text on reset
  const solvedText = document.querySelector('p');
  if (solvedText) {
    solvedText.remove();
  }
}

/* Ensures the user can only enter values 1-9 by checking the character code on
keydown, doesn't prevent default on useful keys like tab, delete, etc. */
function isValidInput(event) {
  const characterCode = event.keyCode;

  if (characterCode > 31 && (characterCode < 49 || characterCode > 57)) {
    event.preventDefault();
    return false;
  }

  return true;
}

/* Iterates over the squares of the board searching for the first empty position
on the board. Returns an array that contains the row and column position.
If there are no empty positions the function returns [-1, -1]. */
function findNextEmptySquare(board) {
  for (var row = 0; row < 9; row++) {
    for (var column = 0; column < 9; column++) {
      if (board[row][column] === 0) {
        return [row, column];
      }
    }
  }

  return [-1, -1];
}

/* Iterates over the row that gets passed in and checks if the new value we want
to add already exists within the row. If it returns true the value is valid for
this row, otherwise it returns false. */
function checkRow(board, row, value) {
  for (var column = 0; column < 9; column++) {
    if (board[row][column] === value) {
      return false;
    }
  }

  return true;
}

/* Iterates over the column that gets passed in and checks if the new value we
want to add already exists within the column. If it returns true the value is
valid for this row, otherwise it returns false. */
function checkColumn(board, column, value) {
  for (var row = 0; row < 9; row++) {
    if (board[row][column] === value) {
      return false;
    }
  }

  return true;
}

/* To work out the current region we need to work out where the first square is.
We divide the row by 3 and use Math.floor to convert it to the biggest integer
less than or equal to the result. We then multiple this number by 3 to get the
most upper row. We do the same to get the most left column. */
function checkRegion(board, row, column, value) {
  regionRow = Math.floor(row / 3) * 3;
  regionColumn = Math.floor(column / 3) * 3;

  for (var row = 0; row < 3; row++) {
    for (var column = 0; column < 3; column++) {
      if (board[regionRow + row][regionColumn + column] === value) {
        return false;
      }
    }
  }

  return true;
}

/* Pulls all of the individual solve checks together into one function. */
function checkValue(board, row, column, value) {
  if (checkRow(board, row, value) &&
    checkColumn(board, column, value) &&
    checkRegion(board, row, column, value)) {
    return true;
  }

  return false;
}

/* Returns the contents of each row as an array.
Example: [8, 0, 0, 4, 0, 6, 0, 0, 7] */
function getRow(board, whichRow) {
  let singleRow = [];

  for (var column = 0; column < 9; column++) {
    singleRow.push(board[whichRow][column]);
  }

  return singleRow;
}

/* Returns the contents of the column as an array.
Example: [8, 0, 0, 5, 0, 0, 0, 0, 3] */
function getColumn(board, whichColumn) {
  let singleColumn = [];

  for (var row = 0; row < 9; row++) {
    singleColumn.push(board[row][whichColumn]);
  }

  return singleColumn;
}

/* Returns an array of invalid row numbers.
Example: [0, 3, 6] */
function findInvalidRows(board) {
  let invalidRows = [];

  for (var row = 0; row < 9; row++) {
    if (checkValid(getRow(board, row)) === false) {
      invalidRows.push(row);
    }
  }

  return invalidRows;
}

/* Returns an array of invalid column numbers.
Example: [1, 2, 3] */
function findInvalidColumns(board) {
  let invalidColumns = [];

  for (var column = 0; column < 9; column++) {
    if (checkValid(getColumn(board, column)) === false) {
      invalidColumns.push(column);
    }
  }

  return invalidColumns;
}

/* Utility function that is used on rows and columns. Filters out the 0s because
there is no value in that cell. It then creates a new set which removes any
duplicate remaining numbers and compares the length of the array excluding zeros
and the new array. If the new array is shorter it declares it an invalid row or
column as a duplicate value must have been removed. */
function checkValid(input) {
  const excludeZeros = input.filter(number => number > 0);
  const validSet = [...new Set(excludeZeros)];

  if (validSet.length < excludeZeros.length) {
    return false;
  }

  return true;
}

/* Implements the Backtracking algo. We check every empty position and try all
the numbers between one and nine to see if they are valid options. */
function solveSudoku(board) {
  let emptySpot = findNextEmptySquare(board);
  let row = emptySpot[0];
  let column = emptySpot[1];

  // If there are no empty squares left on the board
  if (row === -1) {
    isSolved = true;
    // Creates a paragraph to display to the user that the puzzle is complete
    const solvedText = document.createElement('p');
    solvedText.innerText = 'Well done, the Sudoku is solved! 🎉';
    solvedText.classList.add('winner');
    sudokuControls.insertAdjacentElement('afterend', solvedText);
    return board;
  }

  for (let number = 1; number <= 9; number++) {
    if (checkValue(board, row, column, number)) {
      board[row][column] = number;
      // Recurse
      solveSudoku(board);
    }
  }

  if (findNextEmptySquare(board)[0] !== -1) {
    board[row][column] = 0;
  }

  return board;
}

/* Takes in an array of invalid rows and loops over all of the squares in each
invalid row, adding a class of invalid to them. */
function highlightInvalidRows(invalidRows) {
  invalidRows.forEach(function (invalidRow) {
    for (var column = 0; column < 9; column++) {
      targetSquare = document.getElementById('' + invalidRow + column);
      targetSquare.classList.add('invalid');
    }
  });
}

/* Takes in an array of invalid columns and loops over all of the squares in
each invalid column, adding a class to them. */
function highlightInvalidColumns(invalidColumns) {
  invalidColumns.forEach(function (invalidColumn) {
    for (var row = 0; row < 9; row++) {
      targetSquare = document.getElementById('' + row + invalidColumn);
      targetSquare.classList.add('invalid');
    }
  });
}

/* Click handler that tries to solve the current state of the board, if not
solveable it runs validation to show where the issues are. */
function handleSolveClick() {
  const solvedBoard = solveSudoku(getCurrentStateOfBoardFromUI());

  if (isSolved) {
    populateBoardUI(solvedBoard);
  } else {
    handleValidateClick();
    alert('The board is not solvable in the current state');
  }
}

/* Click handler that validates against rows and columns. */
function handleValidateClick() {
  let invalidRows = findInvalidRows(getCurrentStateOfBoardFromUI());
  highlightInvalidRows(invalidRows);

  let invalidColumns = findInvalidColumns(getCurrentStateOfBoardFromUI());
  highlightInvalidColumns(invalidColumns);
}

/* Resets the board to its starting state and updates the UI to remove any
additional styling that has been added. */
function handleResetClick() {
  populateBoardUI(originalBoard);
  updateUI();
}

/* Keydown handler which calls a function that limits the user to only entering
the numbers 1-9. */
function handleUserInput() {
  isValidInput(event);
}

solveButton.addEventListener('click', handleSolveClick);
validateButton.addEventListener('click', handleValidateClick);
resetButton.addEventListener('click', handleResetClick);

userInputs.forEach(function (userInput) {
  userInput.addEventListener('keydown', handleUserInput);
});

/* Populates the board on page load */
populateBoardUI(originalBoard);
