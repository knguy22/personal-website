use csv;

// Country,Title,Chapters Completed,Rating (Out of 10),Reading?,Tags,Notes
type Record = (Option<String>, Option<String>, Option<String>, Option<i32>, Option<String>, Option<String>, Option<String>);

pub fn read_csv(csv_file: &String) -> Result<Vec<Record>, ()> {
    let mut rdr = csv::Reader::from_path(csv_file).unwrap();
    let data = Vec::new();

    let headers = rdr.headers().expect("csv headers");
    println!("{:?}\n", headers);

    for res in rdr.deserialize() {
        let record: Record = res.unwrap();

        let empty_row = false;
        if !empty_row {
            match record.1 {
                Some(c) => println!("{c}"),
                _ => (),
            }
        }
    }

    Ok(data)
}
