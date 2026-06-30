/**
 * Reverse a list without using any built-in functions.
    The function should return a reversed list.
    Input l is a list that may contain any type of data.
 */
reverse_list = (list) =>{
   
    if (!Array.isArray(list)) {
        throw new TypeError("Input must be an array.");
    }
        
    const result = [];
    for (let i = list.length-1; i >= 0; i--) {
        result.push(list[i]);
    }
    return result;
}


const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
/** 
 * Write a program to solve a 9x9 Sudoku board.
    The board must be completed so that every row, column, and 3x3 section
    contains all digits from 1 to 9.
    Input: a 9x9 matrix representing the board.
 * assuuming blank cells are 0 also assume there is always a solution */
solve_sudoku = (board) =>{
    const validate_board = (board) => {
        if (!Array.isArray(board) || board.length !== 9) {
            throw new TypeError("Sudoku board must be a 9x9 matrix.");
        }
    
        for (const row of board) {
            if (!Array.isArray(row) || row.length !== 9) {
                throw new TypeError("Sudoku board must be a 9x9 matrix.");
            }
            for (const cell of row) {
                if (!Number.isInteger(cell) || cell < 0 || cell > 9) {
                    throw new TypeError("Sudoku cells must be integers from 0 to 9.");
                }
            }
        }
    }
    
    //get all the empty cells that has value 0
    const get_empty_cells = (board) => {
        const empty_cells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) empty_cells.push([row, col]);
            }
        }
        return empty_cells;
    }

    const get_box_index = (row, col) => {
        return Math.floor(row / 3) * 3 + Math.floor(col / 3);
    }

    const config_validation_setup = () => {
        const rowSet = new Array(9).fill(null).map(() => new Set())
        const colSet = new Array(9).fill(null).map(() => new Set());
        const boxSet = new Array(9).fill(null).map(() => new Set());

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = copy[row][col];
                if (value === 0) continue;

                rowSet[row].add(value);
                colSet[col].add(value);
                boxSet[get_box_index(row, col)].add(value);
            }
        }

        return { rowSet, colSet, boxSet };
    }

    //get all the available candidate numbers for the given cell
    const get_remaining_numbers = (row, col, usage) => {
        const box_index = get_box_index(row, col);
        const usedDigits = new Set([
            ...usage.rowSet[row],
            ...usage.colSet[col],
            ...usage.boxSet[box_index]
        ]);

        return DIGITS.filter((num) => !usedDigits.has(num));
    }

    //solve the sudoku board using backtracking
    const DFS = (index) => {
        if (index === empty_cells.length) return true;

        const [row, col]= empty_cells[index];
        const numbers= get_remaining_numbers(row, col, usage);
        const box_index= get_box_index(row, col);

        for (const number of numbers) {
            copy[row][col]= number;
            usage.rowSet[row].add(number);
            usage.colSet[col].add(number);
            usage.boxSet[box_index].add(number);

            if (DFS(index+1)) return true;

            usage.rowSet[row].delete(number);
            usage.colSet[col].delete(number);
            usage.boxSet[box_index].delete(number);
            copy[row][col]= 0;
        }

        return false;
    }

    validate_board(board);

    const copy = board.map((row) => row.slice());

    //list out all the empty cells that has value 0
    const empty_cells = get_empty_cells(copy);
    const usage = config_validation_setup();
    const result = DFS(0);

    if (!result) throw new Error("Sudoku puzzle has no valid solution.");
    return copy;
}

module.exports = {
    reverse_list,
    solve_sudoku
}