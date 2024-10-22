/* Taken from https://github.com/loadingio/css-spinner/ */

import styles from './Loading.module.css';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className={styles.ldsRing}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      </div>
    </div>
  )
}