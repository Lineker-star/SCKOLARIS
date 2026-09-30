<?php

namespace App\Enums;

enum AiFeedbackRating:string
{
    case UP = 'up';
    case DOWN = 'down';

    public function labels():string
    {
        return match($this){
            self::UP => 'up',
            self::DOWN => 'down'
        };
    }
}
