<?php

namespace App\Enums;

enum AiMessageRole:string
{
    case USER = 'user';
    case ASSISTANT = 'assistant';

    public function labels():string
    {
        return match($this){
            self::USER => 'user',
            self::ASSISTANT => 'assistant'
        };
    }
}
