<?php

namespace App\Enums;

enum ChatIntent:string
{
    case BOOK_QUESTION = 'book_question';
    case CATALOG_SEARCH_OR_RECOMMEND = 'catalog_search_or_recommend';
    case PLATFORM_HELP = 'platform_help';
}
