<?php

namespace App\Enums;

enum AiIndexStatus:string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case INDEXED = 'indexed';
    case FAILED = 'failed';
    case TOO_LARGE = 'too_large';
    case UNSUPPORTED_FORMAT = 'unsupported_format';

    public function labels():string
    {
        return match($this){
            self::PENDING => 'pending',
            self::PROCESSING => 'processing',
            self::INDEXED => 'indexed',
            self::FAILED => 'failed',
            self::TOO_LARGE => 'too_large',
            self::UNSUPPORTED_FORMAT => 'unsupported_format'
        };
    }
}
