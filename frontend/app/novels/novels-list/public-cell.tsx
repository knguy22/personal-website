interface PublicCellProps {
    value: string
}

// cell that is not editable
export function PublicCell( {value}: PublicCellProps) {
    return <div>{value}</div>
}