<?php

namespace App\Support;

use ArrayAccess;
use Illuminate\Support\Arr;

class ConfigDTO implements ArrayAccess
{
    protected array $items = [];

    public function __construct(array $items = [])
    {
        $this->items = $items;
    }

    public function merge(array|ConfigDTO $data): self
    {
        $items       = $data instanceof self ? $data->all() : $data;
        $this->items = array_replace_recursive($this->items, $items);
        return $this;
    }

    public function all(): array
    {
        return $this->items;
    }

    public function toArray(): array
    {
        return $this->items;
    }

    public function offsetExists($offset): bool
    {
        return Arr::has($this->items, $offset);
    }

    public function offsetGet($offset): mixed
    {
        return $this->get($offset);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return Arr::get($this->items, $key, $default);
    }

    public function offsetSet($offset, $value): void
    {
        $this->set($offset, $value);
    }

    public function set(string $key, mixed $value): self
    {
        Arr::set($this->items, $key, $value);
        return $this;
    }

    public function offsetUnset($offset): void
    {
        Arr::forget($this->items, $offset);
    }
}
