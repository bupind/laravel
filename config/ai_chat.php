<?php
/*
|--------------------------------------------------------------------------
| AI Chat Configuration
|--------------------------------------------------------------------------
| Konfigurasi untuk fitur chat AI di halaman frontend.
| Sesuaikan system_prompt dan data_sources sesuai kebutuhan.
*/
return [
    /*
    |--------------------------------------------------------------------------
    | Anthropic API Key
    |--------------------------------------------------------------------------
    | Ambil dari environment. Isi AI_CHAT_API_KEY di .env
    */
    'api_key'       => env('AI_CHAT_API_KEY', env('ANTHROPIC_API_KEY', '')),
    /*
    |--------------------------------------------------------------------------
    | Model
    |--------------------------------------------------------------------------
    | Model Claude yang digunakan.
    */
    'model'         => env('AI_CHAT_MODEL', 'claude-haiku-4-5-20251001'),
    /*
    |--------------------------------------------------------------------------
    | Max Tokens per respons
    |--------------------------------------------------------------------------
    */
    'max_tokens'    => (int)env('AI_CHAT_MAX_TOKENS', 1024),
    /*
    |--------------------------------------------------------------------------
    | Max riwayat pesan yang dikirim (per sisi, user+assistant)
    |--------------------------------------------------------------------------
    | Membatasi token yang dikirim ke API. Gunakan angka kecil (5-10).
    */
    'max_history'   => (int)env('AI_CHAT_MAX_HISTORY', 10),
    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    | Berapa request per menit per IP yang diizinkan.
    */
    'rate_limit'    => (int)env('AI_CHAT_RATE_LIMIT', 20),
    /*
    |--------------------------------------------------------------------------
    | System Prompt
    |--------------------------------------------------------------------------
    | Instruksi kepribadian dan batasan AI. Sesuaikan dengan kebutuhan bisnis.
    | Placeholder {app_name} dan {context_data} akan diisi otomatis.
    */
    'system_prompt' => env('AI_CHAT_SYSTEM_PROMPT', <<<'PROMPT'
                               Kamu adalah asisten virtual dari {app_name}. Tugasmu adalah membantu pengunjung website mendapatkan informasi yang mereka butuhkan dengan ramah, singkat, dan akurat.

                               PANDUAN:
                               - Jawab hanya berdasarkan informasi yang tersedia di bawah ini. Jangan mengarang informasi.
                               - Jika tidak tahu jawabannya, arahkan user untuk menghubungi tim kami.
                               - Gunakan bahasa yang sama dengan user (Indonesia atau Inggris).
                               - Jaga respons tetap ringkas dan mudah dipahami.
                               - Jangan membahas topik di luar konteks bisnis ini.

                               DATA YANG TERSEDIA:
                               {context_data}
                               PROMPT
    ),
    /*
    |--------------------------------------------------------------------------
    | Data Sources
    |--------------------------------------------------------------------------
    | Tentukan data apa saja dari database yang boleh diakses AI.
    |
    | Format:
    |   'key' => [
    |       'model'   => Model::class,         // Eloquent model
    |       'enabled' => true,                 // aktif/nonaktif
    |       'label'   => 'Nama Seksi',         // label di context
    |       'scope'   => 'active',             // nama scope (opsional)
    |       'fields'  => ['col1', 'col2'],     // kolom yang diambil
    |       'limit'   => 50,                   // max baris
    |   ],
    */
    'data_sources'  => [
        'products' => [
            'model'   => \App\Models\Product::class,
            'enabled' => true,
            'label'   => 'Produk',
            'scope'   => 'published',
            // pakai scopePublished()
            'fields'  => [
                'name',
                'description',
                'price',
                'stock',
                'sku'
            ],
            'limit'   => 100,
        ],
        'services' => [
            'model'   => \App\Models\Service::class,
            'enabled' => true,
            'label'   => 'Layanan',
            'scope'   => 'active',
            // pakai scopeActive()
            'fields'  => [
                'title',
                'description',
                'link_url'
            ],
            'limit'   => 50,
        ],
        'pages' => [
            'model'   => \App\Models\Page::class,
            'enabled' => true,
            'label'   => 'Halaman',
            'scope'   => 'active',
            // pakai scopeActive()
            'fields'  => [
                'title',
                'excerpt',
                'slug'
            ],
            'limit'   => 30,
        ],
        // Tambah data source baru di sini:
        // 'faq' => [
        //     'model'   => \App\Models\Faq::class,
        //     'enabled' => false,
        //     'label'   => 'FAQ',
        //     'fields'  => ['question', 'answer'],
        //     'limit'   => 50,
        // ],
    ],
];
