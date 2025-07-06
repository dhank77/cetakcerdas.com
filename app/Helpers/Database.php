<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;

/*
 * dbExtractMonth
 * This function is used to get month extraction query compatible with different databases
 * @param string $column
 * @return string
 */
if (! function_exists('dbExtractMonth')) {
    function dbExtractMonth(string $column): string
    {
        $driver = DB::getDriverName();

        return match ($driver) {
            'pgsql' => "EXTRACT(MONTH FROM {$column})",
            'mysql' => "MONTH({$column})",
            'sqlite' => "strftime('%m', {$column})",
            default => "EXTRACT(MONTH FROM {$column})"
        };
    }
}

/*
 * dbExtractYear
 * This function is used to get year extraction query compatible with different databases
 * @param string $column
 * @return string
 */
if (! function_exists('dbExtractYear')) {
    function dbExtractYear(string $column): string
    {
        $driver = DB::getDriverName();

        return match ($driver) {
            'pgsql' => "EXTRACT(YEAR FROM {$column})",
            'mysql' => "YEAR({$column})",
            'sqlite' => "strftime('%Y', {$column})",
            default => "EXTRACT(YEAR FROM {$column})"
        };
    }
}

/*
 * dbExtractDate
 * This function is used to get date part extraction query compatible with different databases
 * Supported parts: 'month', 'year', 'day', 'hour', 'minute', 'second'
 * @param string $part
 * @param string $column
 * @return string
 */
if (! function_exists('dbExtractDate')) {
    function dbExtractDate(string $part, string $column): string
    {
        $driver = DB::getDriverName();
        $part = strtolower($part);

        return match ([$driver, $part]) {
            ['pgsql', 'month'] => "EXTRACT(MONTH FROM {$column})",
            ['pgsql', 'year'] => "EXTRACT(YEAR FROM {$column})",
            ['pgsql', 'day'] => "EXTRACT(DAY FROM {$column})",
            ['pgsql', 'hour'] => "EXTRACT(HOUR FROM {$column})",
            ['pgsql', 'minute'] => "EXTRACT(MINUTE FROM {$column})",
            ['pgsql', 'second'] => "EXTRACT(SECOND FROM {$column})",

            ['mysql', 'month'] => "MONTH({$column})",
            ['mysql', 'year'] => "YEAR({$column})",
            ['mysql', 'day'] => "DAY({$column})",
            ['mysql', 'hour'] => "HOUR({$column})",
            ['mysql', 'minute'] => "MINUTE({$column})",
            ['mysql', 'second'] => "SECOND({$column})",

            ['sqlite', 'month'] => "strftime('%m', {$column})",
            ['sqlite', 'year'] => "strftime('%Y', {$column})",
            ['sqlite', 'day'] => "strftime('%d', {$column})",
            ['sqlite', 'hour'] => "strftime('%H', {$column})",
            ['sqlite', 'minute'] => "strftime('%M', {$column})",
            ['sqlite', 'second'] => "strftime('%S', {$column})",

            default => "EXTRACT({$part} FROM {$column})"
        };
    }
}

/*
 * dbLikeOperator
 * This function is used to get like operator
 * @return string
 */
if (! function_exists('dbLikeOperator')) {
    function dbLikeOperator(): string
    {
        $driver = DB::getDriverName();

        return $driver === 'pgsql' ? 'ILIKE' : 'LIKE';
    }
}

/*
 * dbWhereYear
 * This function is used to add year condition compatible with different databases
 * @param \Illuminate\Database\Query\Builder $query
 * @param string $column
 * @param int $year
 * @return \Illuminate\Database\Query\Builder
 */
if (! function_exists('dbWhereYear')) {
    function dbWhereYear($query, string $column, int $year)
    {
        $driver = DB::getDriverName();

        return match ($driver) {
            'pgsql' => $query->whereRaw("EXTRACT(YEAR FROM {$column}) = ?", [$year]),
            'mysql' => $query->whereYear($column, $year),
            'sqlite' => $query->whereRaw("strftime('%Y', {$column}) = ?", [$year]),
            default => $query->whereRaw("EXTRACT(YEAR FROM {$column}) = ?", [$year])
        };
    }
}
