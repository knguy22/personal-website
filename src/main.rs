use std::{env, error::Error};
use csv;

fn read_csv(csv_file: &String) -> Result<(), Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path(csv_file)?;
    let headers = rdr.headers().expect("csv headers");
    println!("{:?}\n", headers);
    let mut i = 0;

    for res in rdr.records() {
        if i == 10 {
            break;
        }
        let record = res.expect("csv record");

        let mut empty_row = true;
        for cell in record.iter() {
            if cell != "" {
                empty_row = false;
                break;
            }
        }

        if !empty_row {
            println!("{:?}", record);
        }
        i += 1;
    }

    Ok(())
}

fn main() {
    let args: Vec<String> = env::args().collect();
    assert!(args.len() == 2, "ERROR: Expected a csv file argument");

    let csv_file = args[1].clone();
    let res = read_csv(&csv_file);
    assert!(!res.is_err(), "ERROR: unexpected execution");
}
