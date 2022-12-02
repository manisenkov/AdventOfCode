use aoc::solution::Solution;

#[derive(Clone, Copy)]
enum Move {
    Left,
    Right,
    Up,
    Down,
}

impl Move {
    fn apply(self, pos: u8) -> u8 {
        match self {
            Move::Left => match pos {
                1 | 4 | 7 => pos,
                _ => pos - 1,
            },
            Move::Right => match pos {
                3 | 6 | 9 => pos,
                _ => pos + 1,
            },
            Move::Up => match pos {
                1..=3 => pos,
                _ => pos - 3,
            },
            Move::Down => match pos {
                7..=9 => pos,
                _ => pos + 3,
            },
        }
    }

    fn apply_ext(self, pos: char) -> char {
        match self {
            Move::Left => match pos {
                '3' => '2',
                '4' => '3',
                '6' => '5',
                '7' => '6',
                '8' => '7',
                '9' => '8',
                'B' => 'A',
                'C' => 'B',
                _ => pos,
            },
            Move::Right => match pos {
                '2' => '3',
                '3' => '4',
                '5' => '6',
                '6' => '7',
                '7' => '8',
                '8' => '8',
                'A' => 'B',
                'B' => 'C',
                _ => pos,
            },
            Move::Up => match pos {
                '3' => '1',
                '6' => '2',
                '7' => '3',
                '8' => '4',
                'A' => '6',
                'B' => '7',
                'C' => '8',
                'D' => 'B',
                _ => pos,
            },
            Move::Down => match pos {
                '1' => '3',
                '2' => '6',
                '3' => '7',
                '4' => '8',
                '6' => 'A',
                '7' => 'B',
                '8' => 'C',
                'B' => 'D',
                _ => pos,
            },
        }
    }

    fn from_char(c: char) -> Self {
        match c {
            'L' => Move::Left,
            'R' => Move::Right,
            'U' => Move::Up,
            'D' => Move::Down,
            _ => panic!("invalid character"),
        }
    }
}

struct Day2016_02 {
    instructions: Vec<Vec<Move>>,
}

impl Solution<String> for Day2016_02 {
    fn new() -> Day2016_02 {
        Day2016_02 {
            instructions: Vec::new(),
        }
    }

    fn init(&mut self, input: &str) {
        for line in input.lines() {
            let moves: Vec<Move> = line.trim().chars().map(Move::from_char).collect();
            self.instructions.push(moves);
        }
    }

    fn part_one(&mut self) -> String {
        let mut pos = 5;
        let res = self
            .instructions
            .iter()
            .map(|moves| {
                let mut cur_pos = pos;
                for mov in moves.iter() {
                    cur_pos = mov.apply(cur_pos);
                }
                pos = cur_pos;
                cur_pos.to_string()
            })
            .collect();
        res
    }

    fn part_two(&mut self) -> String {
        let mut pos = '5';
        let res = self
            .instructions
            .iter()
            .map(|moves| {
                let mut cur_pos = pos;
                for mov in moves.iter() {
                    cur_pos = mov.apply_ext(cur_pos);
                }
                pos = cur_pos;
                cur_pos.to_string()
            })
            .collect();
        res
    }
}

fn main() {
    let mut sol = Day2016_02::new();
    sol.run_on_stdin()
}

#[cfg(test)]
mod tests {
    use crate::Day2016_02;
    use aoc::solution::Solution;

    const TEST_INPUT: &str = include_str!("../../examples/2016_02.txt");

    #[test]
    fn test_1() {
        let mut sol = Day2016_02::new();
        sol.init(TEST_INPUT);
        assert_eq!(sol.part_one(), "1985");
        assert_eq!(sol.part_two(), "5DB3");
    }
}